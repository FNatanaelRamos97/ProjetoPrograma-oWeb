import multer from "multer";
import path from "path";
import fs from "fs";

const tempFolder = path.resolve(__dirname, "..", "..", "tmp");
const uploadFolder = path.resolve(__dirname, "..", "..", "uploads");

for (const folder of [tempFolder, uploadFolder]) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: tempFolder,
  filename: (request, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    callback(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (request, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Formato de imagem inválido."));
    }

    return callback(null, true);
  }
});