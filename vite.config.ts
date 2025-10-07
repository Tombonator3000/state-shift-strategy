import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const resolvePort = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export default defineConfig(({ mode }) => {
  const sharedPort = resolvePort(process.env.PORT);
  const devPort = resolvePort(process.env.DEV_PORT);
  const previewPort = resolvePort(process.env.PREVIEW_PORT);

  const serverPort = sharedPort ?? devPort ?? 5173;
  const previewServerPort = previewPort ?? sharedPort ?? 4173;

  return {
    server: {
      host: "0.0.0.0",
      port: serverPort,
    },
    preview: {
      host: "0.0.0.0",
      port: previewServerPort,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
