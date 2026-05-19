import { Router } from "express";
import { ClothingCategory, ClothingCondition, ClothingStyle } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

export const listingRouter = Router();

const imageValueSchema = z.string().refine(value => {
  if (value.startsWith("data:image/")) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Imagen invalida");

const listingInputSchema = z.object({
  title: z.string().min(3),
  brand: z.string().optional(),
  category: z.nativeEnum(ClothingCategory),
  style: z.nativeEnum(ClothingStyle).default(ClothingStyle.CASUAL),
  size: z.string().min(1),
  condition: z.nativeEnum(ClothingCondition),
  description: z.string().optional(),
  priceClp: z.coerce.number().int().positive(),
  imageUrls: z.array(imageValueSchema).default([])
});

const createListingSchema = listingInputSchema;
const updateListingSchema = listingInputSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: "Debes enviar al menos un campo para actualizar"
});

const listingInclude = {
  seller: { select: { id: true, name: true, city: true, commune: true, avatarUrl: true } },
  _count: { select: { likes: true } }
};

listingRouter.get("/", async (req, res) => {
  const category = req.query.category as ClothingCategory | undefined;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category } : {})
    },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return res.json({ listings });
});

listingRouter.get("/mine/all", requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user!.id },
    include: listingInclude,
    orderBy: { createdAt: "desc" }
  });

  return res.json({ listings });
});

listingRouter.get("/likes/mine", requireAuth, async (req, res) => {
  const likes = await prisma.like.findMany({
    where: { userId: req.user!.id },
    include: { listing: { include: listingInclude } },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ listings: likes.map(like => like.listing) });
});

listingRouter.get("/liked-ids/mine", requireAuth, async (req, res) => {
  const likes = await prisma.like.findMany({
    where: { userId: req.user!.id },
    select: { listingId: true }
  });

  return res.json({ listingIds: likes.map(like => like.listingId) });
});

listingRouter.get("/user/:userId", async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: {
      sellerId: req.params.userId,
      status: "ACTIVE"
    },
    include: listingInclude,
    orderBy: { createdAt: "desc" }
  });

  return res.json({ listings });
});

listingRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Datos invalidos", errors: parsed.error.flatten() });
  }

  const listing = await prisma.listing.create({
    data: {
      ...parsed.data,
      sellerId: req.user!.id,
      status: "ACTIVE"
    },
    include: listingInclude
  });

  return res.status(201).json({ listing });
});

listingRouter.patch("/:id", requireAuth, async (req, res) => {
  const listingId = String(req.params.id);
  const parsed = updateListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Datos invalidos", errors: parsed.error.flatten() });
  }

  const currentListing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true }
  });

  if (!currentListing) return res.status(404).json({ message: "Prenda no encontrada" });
  if (currentListing.sellerId !== req.user!.id) {
    return res.status(403).json({ message: "Solo puedes editar tus propias publicaciones" });
  }

  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: parsed.data,
    include: listingInclude
  });

  return res.json({ listing, message: "Publicacion actualizada" });
});

listingRouter.post("/:id/like", requireAuth, async (req, res) => {
  const listingId = String(req.params.id);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true }
  });

  if (!listing) return res.status(404).json({ message: "Prenda no encontrada" });
  if (listing.sellerId === req.user!.id) return res.status(400).json({ message: "No puedes dar me gusta a tu propia publicacion" });

  await prisma.like.upsert({
    where: { userId_listingId: { userId: req.user!.id, listingId } },
    update: {},
    create: { userId: req.user!.id, listingId }
  });

  return res.status(201).json({ liked: true });
});

listingRouter.delete("/:id/like", requireAuth, async (req, res) => {
  const listingId = String(req.params.id);

  await prisma.like.deleteMany({
    where: { userId: req.user!.id, listingId }
  });

  return res.json({ liked: false });
});

listingRouter.get("/:id", async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: listingInclude
  });

  if (!listing) return res.status(404).json({ message: "Prenda no encontrada" });
  return res.json({ listing });
});