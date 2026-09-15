export function detectHasAlpha(image: HTMLImageElement | undefined): boolean {
  if (!image) return false;
  try {
    const canvas = document.createElement("canvas");
    const width = (canvas.width = Math.min(
      image.naturalWidth || image.width || 1,
      64,
    ));
    const height = (canvas.height = Math.min(
      image.naturalHeight || image.height || 1,
      64,
    ));
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.drawImage(image, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
    return false;
  } catch {
    return false;
  }
}
