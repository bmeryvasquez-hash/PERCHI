import { Router } from "express";
import { ClothingCategory, ClothingCondition } from "@prisma/client";
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

const createListingSchema = z.object({
  title: z.string().min(3),
  brand: z.string().optional(),
  category: z.nativeEnum(ClothingCategory),
  size: z.string().min(1),
  condition: z.nativeEnum(ClothingCondition),
  description: z.string().optional(),
  priceClp: z.coerce.number().int().positive(),
  imageUrls: z.array(imageValueSchema).default([])
});

listingRouter.get("/", async (req, res) => {
  const category = req.query.category as ClothingCategory | undefined;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category } : {})
    },
    include: {
      seller: { select: { id: true, name: true, city: true, avatarUrl: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return res.json({ listings });
});

listingRouter.get("/mine/all", requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user!.id },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ listings });
});

listingRouter.get("/user/:userId", async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: {
      sellerId: req.params.userId,
      status: "ACTIVE"
    },
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
    }
  });

  return res.status(201).json({ listing });
});

listingRouter.get("/:id", async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { seller: { select: { id: true, name: true, city: true, avatarUrl: true } } }
  });

  if (!listing) return res.status(404).json({ message: "Prenda no encontrada" });
  return res.json({ listing });
});
