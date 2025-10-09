import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const resolvedPort = Number(process.env.PORT ?? process.env.VITE_PORT ?? 0) || 5173;
  const resolvedPreviewPort = Number(process.env.PREVIEW_PORT ?? resolvedPort);

  const shouldEnableLovableTagger =
    mode === "development" && process.env.ENABLE_LOVABLE_TAGGER === "true";

  return {
    server: {
      host: "0.0.0.0",
      port: resolvedPort,
    },
    preview: {
      host: "0.0.0.0",
      port: resolvedPreviewPort,
    },
    plugins: [react(), shouldEnableLovableTagger && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
