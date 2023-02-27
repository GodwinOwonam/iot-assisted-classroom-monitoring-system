import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

type ValidExtension = 'png' | 'jpeg' | 'jpg' | 'jp2' | 'webp';
type ValidMime =
  | 'image/png'
  | 'image/jpeg'
  | 'image/jp2'
  | 'image/webp'
  | 'image/jpg';

const validFileExtensions: ValidExtension[] = [
  'png',
  'jpeg',
  'jpg',
  'jp2',
  'webp',
];
const validMimeTypes: ValidMime[] = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/jp2',
  'image/webp',
];

export const saveProfileImageToStorage = {
  storage: diskStorage({
    destination: './src/images/profiles',
    filename: (req, file, cb) => {
      //   const path = await import('path');
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = 'IMS' + Date.now() + fileExtension;

      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes: ValidMime[] = validMimeTypes;

    allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlink(fullFilePath, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(err);
  }
};
