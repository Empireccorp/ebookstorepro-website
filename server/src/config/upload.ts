import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Configuração de storage para covers
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/covers'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  },
});

// Configuração de storage para PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/pdfs'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `ebook-${uniqueSuffix}${ext}`);
  },
});

// Filtro para imagens
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
  }
};

// Filtro para PDFs
const pdfFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF is allowed.'));
  }
};

// Upload de capa
export const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload de PDF
export const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
