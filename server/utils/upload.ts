import { Request, Response, NextFunction } from "express";
import os from "os";
import path from "path";
import multer from "multer";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

const restoreStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, `restore-${Date.now()}.json`);
  },
});

export const restoreUpload = multer({
  storage: restoreStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const AI_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const AI_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];

const aiImageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AI_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (AI_IMAGE_MIME_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "UNSUPPORTED_TYPE"));
  },
}).single("file");

export const aiImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  aiImageMulter(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res
        .status(413)
        .json({
          error: "Image is too large. Please upload an image under 8 MB.",
        });
      return;
    }
    if (err instanceof multer.MulterError && err.field === "UNSUPPORTED_TYPE") {
      res
        .status(415)
        .json({
          error:
            "Unsupported image format. Please upload a PNG, JPG, WEBP, or HEIC image.",
        });
      return;
    }
    console.error("AI image upload failed:", err);
    res.status(400).json({ error: "Could not read the uploaded image." });
  });
};
