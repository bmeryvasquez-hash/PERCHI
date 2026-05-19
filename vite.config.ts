import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function readViteEnv() {
  const envPath = path.resolve(__dirname, "../../.env");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.startsWith("VITE_"))
      .map(line => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex);
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['\"]|['\"]$/g, "");
        return [`import.meta.env.${key}`, JSON.stringify(value)];
      })
  );
}

export default defineConfig({
  define: readViteEnv(),
  plugins: [react()],
  server: { port: 5173 }
});