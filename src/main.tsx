import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AudioProvider } from '@/contexts/AudioContext';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AudioProvider>
    <App />
  </AudioProvider>
);
