import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const resolvedPort = Number(process.env.PORT) || 5173;

  return {
    server: {
      host: "0.0.0.0",
      port: resolvedPort,
    },
    preview: {
      host: "0.0.0.0",
      port: resolvedPort,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
