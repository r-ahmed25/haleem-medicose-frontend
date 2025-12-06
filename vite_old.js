import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {

  // ✅ Correct way to read env in vite.config.js
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],

    build: {
      outDir: "dist",
    },

    server: {
      host: true,
      port: 5173,

      // ✅ ONLY use HTTPS in local dev
    https: env.VITE_USE_HTTPS === "true" ? {
    key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "localhost.pem")),
  } : false,

      // ✅ DEV ONLY PROXY
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,   // allow self-signed
        },
      },
    },
  };
});

