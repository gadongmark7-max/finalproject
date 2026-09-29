const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/heic": "heic",
  "image/heif": "heif",
};

const IMAGE_EXTENSION = /\.(jpe?g|png|gif|webp|avif|svg|bmp|heic|heif)$/i;

function parseHttpUrl(url: string): URL | null {
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").slice(0, 120);
}

export function getImageFileName(url: string, mimeType?: string, fallback = "image") {
  const parsed = parseHttpUrl(url);
  const lastSegment = parsed
    ? decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "")
    : "";
  const base = sanitizeFileName(lastSegment) || fallback;

  if (IMAGE_EXTENSION.test(base)) return base;
  const extension = mimeType ? MIME_EXTENSIONS[mimeType.split(";")[0].trim()] : undefined;
  return extension ? `${base.replace(/\.[^.]*$/, "")}.${extension}` : base;
}

function toCloudinaryAttachmentUrl(parsed: URL): string | null {
  if (parsed.hostname !== "res.cloudinary.com") return null;
  if (!/\/upload\//.test(parsed.pathname)) return null;
  const next = new URL(parsed.toString());
  next.pathname = next.pathname.replace("/upload/", "/upload/fl_attachment/");
  return next.toString();
}

function clickDownloadLink(href: string, fileName?: string) {
  const link = document.createElement("a");
  link.href = href;
  if (fileName) link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadImage(url: string, fallbackName = "image") {
  const parsed = parseHttpUrl(url);
  if (!parsed) throw new Error("This image link is not valid.");

  try {
    const response = await fetch(parsed.toString(), { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      clickDownloadLink(objectUrl, getImageFileName(url, blob.type, fallbackName));
    } finally {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
  } catch {
    const attachmentUrl = toCloudinaryAttachmentUrl(parsed);
    if (!attachmentUrl) throw new Error("Could not download this image. Please try again.");
    clickDownloadLink(attachmentUrl);
  }
}
