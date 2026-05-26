import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import path from "node:path";

const uploadDir = path.resolve(__dirname, "../../uploads");

const mimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

type StoredImage = {
  path: string;
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Formato de imagen invalido");

  const [, mimeType, payload] = match;
  const extension = mimeToExtension[mimeType];
  if (!extension) throw new Error("Tipo de imagen no permitido");

  const buffer = Buffer.from(payload, "base64");
  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede superar 5 MB");
  }

  return { buffer, extension };
}

async function uploadToCloudinary(dataUrl: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Faltan CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET");
  }

  const form = new FormData();
  form.append("file", dataUrl);
  form.append("upload_preset", uploadPreset);
  form.append("folder", process.env.CLOUDINARY_FOLDER ?? "perchi");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form
  });

  const data = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? "No se pudo subir la imagen");
  }

  return data.secure_url;
}

async function uploadToLocalStorage(dataUrl: string): Promise<StoredImage> {
  const { buffer, extension } = parseDataUrl(dataUrl);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return { path: `/uploads/${filename}` };
}

export async function storeImage(dataUrl: string, publicBaseUrl: string) {
  if (process.env.IMAGE_STORAGE_PROVIDER === "cloudinary") {
    return uploadToCloudinary(dataUrl);
  }

  const stored = await uploadToLocalStorage(dataUrl);
  return `${publicBaseUrl.replace(/\/$/, "")}${stored.path}`;
}

export function getLanPublicBaseUrl(port: number) {
  const interfaces = networkInterfaces();

  for (const values of Object.values(interfaces)) {
    for (const value of values ?? []) {
      if (value.family === "IPv4" && !value.internal && value.address.startsWith("192.168.")) {
        return `http://${value.address}:${port}`;
      }
    }
  }

  for (const values of Object.values(interfaces)) {
    for (const value of values ?? []) {
      if (value.family === "IPv4" && !value.internal) {
        return `http://${value.address}:${port}`;
      }
    }
  }

  return `http://localhost:${port}`;
}
