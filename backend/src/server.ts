import path from "node:path";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { listingRouter } from "./routes/listing.routes";
import { subscriptionRouter } from "./routes/subscription.routes";
import { uploadRouter } from "./routes/upload.routes";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const configuredOrigins = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map(origin => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function isAllowedOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isDevPort = url.port === "5173" || url.port === "5174";
    const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isPrivateLan =
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    return configuredOrigins.includes(normalizedOrigin) || (isDevPort && (isLocalhost || isPrivateLan));
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origen no permitido por CORS"));
  }
}));
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Perchi API" });
});

app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/uploads", uploadRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(port, () => {
  console.log(`Perchi API ejecut\u00e1ndose en http://localhost:${port}`);
});
