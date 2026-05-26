import bcrypt from "bcryptjs";
import { DeliveryMode } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { signToken } from "../utils/jwt";

export const authRouter = Router();

const imageValueSchema = z.string().url("Imagen invalida");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  city: z.string().optional(),
  commune: z.string().optional()
});

const profileSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
  commune: z.string().optional(),
  bio: z.string().max(240).optional(),
  avatarUrl: imageValueSchema.optional(),
  deliveryMode: z.nativeEnum(DeliveryMode).optional()
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos invalidos", errors: parsed.error.flatten() });

  const { name, email, password, city, commune } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "El correo ya esta registrado" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, city, commune }
  });

  const token = signToken(user.id);

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, status: user.status }
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos invalidos" });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ message: "Credenciales invalidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciales invalidas" });

  const token = signToken(user.id);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, status: user.status } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      commune: true,
      bio: true,
      avatarUrl: true,
      deliveryMode: true,
      status: true,
      communityRole: true,
      createdAt: true,
      _count: { select: { listings: true } }
    }
  });

  return res.json({ user });
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Datos invalidos", errors: parsed.error.flatten() });

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      commune: true,
      bio: true,
      avatarUrl: true,
      deliveryMode: true,
      status: true,
      communityRole: true,
      createdAt: true,
      _count: { select: { listings: true } }
    }
  });

  return res.json({ user, message: "Perfil actualizado" });
});


authRouter.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      city: true,
      commune: true,
      bio: true,
      avatarUrl: true,
      deliveryMode: true,
      status: true,
      createdAt: true,
      _count: { select: { listings: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return res.json({ users });
});
authRouter.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      city: true,
      commune: true,
      bio: true,
      avatarUrl: true,
      deliveryMode: true,
      status: true,
      createdAt: true,
      _count: { select: { listings: true } }
    }
  });

  if (!user) return res.status(404).json({ message: "Usuaria no encontrada" });
  return res.json({ user });
});
