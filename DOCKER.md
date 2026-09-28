# Docker — Ink of Baphomet

## Architecture

```
Internet ──► nginx :80/:443  (only published ports)
               ├── /api/create-checkout-session*  ──► client  (Next.js :3000, PayMongo route handlers)
               ├── /api/*  (prefix stripped)       ──► server  (Express :5001)
               └── /*                              ──► client  (Next.js :3000)
                                                         server ──► mongo :27017 (internal network, no ports)
```

| Network   | Members                       | Notes                                              |
|-----------|-------------------------------|----------------------------------------------------|
| `backend` | mongo, server                 | `internal: true`: no internet access, no published ports |
| `edge`    | nginx, client, server, certbot| Egress for Cloudinary, Brevo, Gemini, PayMongo     |

Express mounts its routes at the root (`/auth`, `/account`, `/booking`, …), so Nginx
strips `/api`: `https://inkofbaphomet.com/api/auth/login` → Express `/auth/login`.
The browser bundle is built with `NEXT_PUBLIC_BACKEND_URL_LIVE=/api` (same origin),
so the same image works on the real domain, `http://localhost` and a Codespaces URL.

`/api/auth/*` (login, register, OTP, password reset) is rate limited at Nginx to
20 requests/minute per IP (burst 20); over the limit it returns `429` with a plain-text message.
Nginx re-resolves container names every 10 s, so recreating `client` or `server` does not
require restarting Nginx.

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development: `npm run dev`, bind mounts, hot reload |
| `docker-compose.prod.yml` | Production: built images, Nginx, Mongo volume, health checks |
| `docker-compose.atlas.yml` | Optional override: use MongoDB Atlas instead of the `mongo` container |
| `client/Dockerfile` | Multi-stage Next.js build, `output: "standalone"`, non-root |
| `server/Dockerfile` | Multi-stage TypeScript build, prod deps only, non-root |
| `nginx/nginx.conf` | HTTP only (local / Codespaces / first certificate) |
| `nginx/nginx.ssl.conf` | HTTPS for inkofbaphomet.com |
| `nginx/snippets/*.conf` | Routing and proxy headers shared by both configs |
| `.env.example` | Compose variables (Mongo credentials, build args, Nginx mode) |
| `client/.env.example`, `server/.env.example` | App variables |

## Environment

```bash
cp .env.example .env                  # compose: Mongo creds, NGINX_CONF, ports
cp server/.env.example server/.env    # Express secrets
cp client/.env.example client/.env    # PayMongo key for Next.js route handlers
```

- `.env` files are git-ignored and excluded by `.dockerignore`; they are injected
  at runtime via `env_file`, never copied into images.
- `NEXT_PUBLIC_*` values are inlined into the browser bundle **at build time**. In
  production they come from the root `.env` as build args. Changing them requires
  a rebuild of `client`. Never put a secret in a `NEXT_PUBLIC_*` variable.
- In production compose, `MONGODB_URI` and `PORT` from `server/.env` are overridden
  to use the bundled `mongo` service. Use URL-safe characters for
  `MONGO_ROOT_PASSWORD` (`openssl rand -hex 24`).
- `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD` only take effect when the
  `mongo_data` volume is **first** created.

## Local / Codespaces development

```bash
docker compose up --build        # client :3000, server :5001, mongo 127.0.0.1:27017
```

Uses the dev Mongo container by default. Set `DEV_MONGODB_URI` in the root `.env` to
use Atlas instead. Running `npm run dev` directly in `client/` and `server/` still works as
before. Stop those first, because the ports would clash.

## Production

```bash
docker compose -f docker-compose.prod.yml config -q      # validate
docker compose -f docker-compose.prod.yml build          # build images
docker compose -f docker-compose.prod.yml up -d          # start
docker compose -f docker-compose.prod.yml ps             # status + health
docker compose -f docker-compose.prod.yml logs -f        # all logs (or: logs -f server)
docker compose -f docker-compose.prod.yml down           # stop (volumes are kept)
docker compose -f docker-compose.prod.yml up -d --build  # rebuild + restart changed services
```

### Verify

```bash
docker compose -f docker-compose.prod.yml ps               # mongo/server/nginx "(healthy)"
curl -s  http://localhost/api/health                        # {"status":"ok","db":true}
curl -sI http://localhost/ | head -1                        # 200 from Next.js
curl -s -o /dev/null -w '%{http_code}\n' http://localhost/api/account/allUsers   # 401 (auth enforced)
docker inspect --format '{{.State.Health.Status}}' inkofbaphomet-server-1
```

After HTTPS is enabled, use `https://inkofbaphomet.com/...` for these checks.

### Creating the first admin (or the artist) account

There are no seed routes. Use the CLI inside the server container; the password
(at least 12 characters) is read from stdin so it never lands in shell history:

```bash
read -rs PW   # type the password, press Enter
printf '%s' "$PW" | docker compose -f docker-compose.prod.yml exec -T server \
  node dist/scripts/createAccount.js --type admin --email you@example.com --name "Admin"
unset PW
```

`--type artist` also creates the artist profile (schedule defaults Mon–Fri 08:00–15:00)
and emails the artist a login access code.

### Artist access codes

Artist accounts must enter an access code after their password. Codes are stored
only as bcrypt hashes. Admins can re-issue a code from the Users page, or use the CLI:

```bash
# issue codes (by email) to every existing artist that does not have one yet
docker compose -f docker-compose.prod.yml exec -T server \
  node dist/scripts/setArtistAccessCode.js --all-missing

# issue a new code to one artist by email
docker compose -f docker-compose.prod.yml exec -T server \
  node dist/scripts/setArtistAccessCode.js --email artist@example.com

# or set a specific code (read from stdin, never echoed)
read -rs CODE
printf '%s' "$CODE" | docker compose -f docker-compose.prod.yml exec -T server \
  node dist/scripts/setArtistAccessCode.js --email artist@example.com
unset CODE
```

## HTTPS (Let's Encrypt)

TLS lives outside the app images: certbot runs as an on-demand container (profile
`tls`), certificates are stored in `./certbot/conf` (git-ignored) and mounted read-only
into Nginx.

1. Point DNS at the server (see below) and wait for it to resolve.
2. Start with the HTTP config (`NGINX_CONF=nginx.conf` in `.env`):
   `docker compose -f docker-compose.prod.yml up -d`
3. Issue the certificate:
   ```bash
   docker compose -f docker-compose.prod.yml --profile tls run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d inkofbaphomet.com -d www.inkofbaphomet.com \
     --email <you@example.com> --agree-tos --no-eff-email
   ```
4. Set `NGINX_CONF=nginx.ssl.conf` in `.env`, then recreate Nginx:
   `docker compose -f docker-compose.prod.yml up -d nginx`
5. Renewal (host crontab, daily):
   ```cron
   0 3 * * * cd /var/www/inkofbaphomet && docker compose -f docker-compose.prod.yml --profile tls run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
   ```

`nginx.ssl.conf` redirects all HTTP and `https://www.` to `https://inkofbaphomet.com`
and sends HSTS (`max-age=31536000`, no `includeSubDomains`/`preload`; add those only
once you are sure every subdomain is HTTPS).

## DNS

Create at your DNS provider (`<SERVER_IP>` = the VPS public IPv4):

| Type | Name  | Value         |
|------|-------|---------------|
| A    | `@`   | `<SERVER_IP>` |
| A    | `www` | `<SERVER_IP>` |
| AAAA | `@`, `www` | `<SERVER_IPv6>`, only if the server has IPv6 and port 80/443 are open on it |

(`www` may instead be `CNAME www → inkofbaphomet.com`.) Open ports 80 and 443 in the
server firewall. Keep 27017, 3000 and 5001 closed; compose does not publish them.

## Using MongoDB Atlas instead of the container

Set `ATLAS_MONGODB_URI` in the root `.env` (keep the `MONGO_*` values set; they are
still required by the compose file even though the container is not started), allow
the VPS public IP in Atlas → Network Access, then add the override to **every**
compose command:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.atlas.yml up -d
```

## MongoDB backup

The dump runs inside the `mongo` container using its own credentials (the password
never appears on the host command line):

```bash
mkdir -p db-dumps
docker compose -f docker-compose.prod.yml exec -T mongo sh -c \
  'mongodump -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
   --authenticationDatabase admin --db inkofbaphomet --archive --gzip' \
  > db-dumps/inkofbaphomet-$(date +%F-%H%M).archive.gz
ls -lh db-dumps/    # a few-byte file means the dump failed; check the output
```

Copy dumps off the server (object storage, another machine). `db-dumps/` is git-ignored.
The app's own JSON backups (admin → Backup) persist in the `server_backups` volume.

## MongoDB restore

**`--drop` replaces the existing collections.** Take a fresh backup first.

```bash
docker compose -f docker-compose.prod.yml exec -T mongo sh -c \
  'mongorestore -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" \
   --authenticationDatabase admin --nsInclude "inkofbaphomet.*" --drop --archive --gzip' \
  < db-dumps/<file>.archive.gz
```

### Migrating the existing Atlas data into the container

The `mongo` service has no internet access, so dump Atlas from a throwaway container:

```bash
mkdir -p db-dumps
docker run --rm -v "$PWD/db-dumps:/dump" mongo:7 \
  mongodump --uri '<ATLAS_MONGODB_URI>' --archive=/dump/atlas.archive.gz --gzip
# then run the restore command above with db-dumps/atlas.archive.gz
```

## Updating production

```bash
cd /var/www/inkofbaphomet
git pull
# 1. back up the database (see above)
# 2. keep the current images for rollback
docker tag inkofbaphomet-server:latest inkofbaphomet-server:previous
docker tag inkofbaphomet-client:latest inkofbaphomet-client:previous
# 3. build, then swap
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps && curl -s https://inkofbaphomet.com/api/health
```

Rollback: `docker tag inkofbaphomet-server:previous inkofbaphomet-server:latest` (same
for client), then `docker compose -f docker-compose.prod.yml up -d`.

## Codespaces notes

- Codespaces is for development and testing the stack. Run production on a VPS.
- Port 80 is forwarded by Codespaces; the app works on the forwarded URL because the
  API base is the relative `/api` and PayMongo redirects use the request `Origin`.
- If containers on compose networks cannot reach each other or the internet
  (Mongo "Server selection timed out", `bad address`), the Codespace has stale
  `iptables-legacy` rules with `FORWARD DROP`. Fix it for the current session:
  ```bash
  sudo iptables-legacy -I DOCKER-USER -i br-+ -j ACCEPT
  sudo iptables-legacy -I DOCKER-USER -o br-+ -j ACCEPT
  ```
  This is a host issue in the Codespace, not part of the project config.
