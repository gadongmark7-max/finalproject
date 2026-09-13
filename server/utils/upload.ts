import path from 'path';
import multer from 'multer';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const upload = multer({ storage });

const restoreStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `restore-${Date.now()}.json`);
  },
});

export const restoreUpload = multer({
  storage: restoreStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
