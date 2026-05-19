import "dotenv/config";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { listingRouter } from "./routes/listing.routes";
import { subscriptionRouter } from "./routes/subscription.routes";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Bien Barbie API" });
});

app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/subscriptions", subscriptionRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(`Bien Barbie API ejecutándose en http://localhost:${port}`);
});
