import multer from 'multer';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { env } from '../config/env.js';

const storage = multer.memoryStorage();

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function fileFilter(req, file, cb) {
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError(ErrorCodes.UNSUPPORTED_FILE, `Unsupported image format: ${file.mimetype}. Allowed formats: JPEG, PNG, WEBP`, 400), false);
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 6,
  },
});

