import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary'; // Ahora sí funciona el named import nativo en v4
import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // En la v4, esto funciona directo
  params: {
    folder: process.env.CLOUDINARY_FOLDER,
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // ... tu filtro ...
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

export default upload;