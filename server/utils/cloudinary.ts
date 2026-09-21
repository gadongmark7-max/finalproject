import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "res.cloudinary.com") return null;
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]).replace(/\.[^./]+$/, "");
  } catch {
    return null;
  }
};

export const deleteCloudinaryAsset = async (
  url: string,
  resourceType: string = "image",
): Promise<"ok" | "not found" | "skipped"> => {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return "skipped";

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`cloudinary destroy failed: ${result.result}`);
  }
  return result.result;
};
