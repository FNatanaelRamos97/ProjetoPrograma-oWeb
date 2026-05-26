import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function saveImageAsWebp(filePath: string, folderName: string) {
  const uploadsFolder = path.resolve(__dirname, "..", "..", "uploads", folderName);

  if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
  }

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(uploadsFolder, fileName);

  await sharp(filePath)
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  fs.unlinkSync(filePath);

  return `/uploads/${folderName}/${fileName}`;
}