import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

export const subscriptionRouter = Router();

subscriptionRouter.get("/me", requireAuth, async (req, res) => {
  const subscription = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
  return res.json({ subscription });
});

subscriptionRouter.post("/mock-activate", requireAuth, async (req, res) => {
  const monthlyFeeClp = Number(process.env.MONTHLY_FEE_CLP ?? 6990);
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { userId: req.user!.id },
    create: {
      userId: req.user!.id,
      provider: "mock",
      providerRef: `mock_${Date.now()}`,
      monthlyFeeClp,
      active: true,
      currentPeriodEnd
    },
    update: {
      active: true,
      monthlyFeeClp,
      currentPeriodEnd
    }
  });

  await prisma.user.update({
    where: { id: req.user!.id },
    data: { status: "ACTIVE" }
  });

  return res.json({
    message: "Membresía activada en modo desarrollo",
    subscription
  });
});
