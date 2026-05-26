import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { getLanPublicBaseUrl, storeImage } from "../services/imageStorage";

export const uploadRouter = Router();

const uploadImageSchema = z.object({
  dataUrl: z.string().startsWith("data:image/")
});

uploadRouter.post("/images", requireAuth, async (req, res) => {
  const parsed = uploadImageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Imagen invalida", errors: parsed.error.flatten() });
  }

  const publicBaseUrl = process.env.PUBLIC_API_URL ?? getLanPublicBaseUrl(Number(process.env.PORT ?? 4000));

  try {
    const imageUrl = await storeImage(parsed.data.dataUrl, publicBaseUrl);
    return res.status(201).json({ imageUrl });
  } catch (err) {
    return res.status(400).json({ message: err instanceof Error ? err.message : "No se pudo subir la imagen" });
  }
});
