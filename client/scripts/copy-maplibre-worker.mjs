import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = require.resolve("maplibre-gl/package.json", { paths: [root] });
const { version } = JSON.parse(readFileSync(pkgPath, "utf8"));
const distDir = join(dirname(pkgPath), "dist");
const outRoot = join(root, "public", "maplibre");
const outDir = join(outRoot, version);

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(distDir, file), join(outDir, file));
}
console.log(`maplibre-gl ${version} worker copied to public/maplibre/${version}`);
