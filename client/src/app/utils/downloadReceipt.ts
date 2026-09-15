import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export async function downloadReceiptPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const pixelRatio = 1.5;

  const dataUrl = await toJpeg(element, {
    backgroundColor: "#fafafa",
    pixelRatio,
    quality: 0.85,
    filter: (node) =>
      !(node instanceof Element) || !node.hasAttribute("data-pdf-ignore"),
  });

  const image = await loadImage(dataUrl);

  const pdf = new jsPDF({
    orientation: image.width >= image.height ? "landscape" : "portrait",
    unit: "px",
    format: [image.width, image.height],
    compress: true,
  });

  pdf.addImage(
    dataUrl,
    "JPEG",
    0,
    0,
    image.width,
    image.height,
    undefined,
    "FAST",
  );
  pdf.save(filename);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
