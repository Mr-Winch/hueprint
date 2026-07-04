import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ColorHarmonyDemo } from "./App";
import "./demo.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorHarmonyDemo />
  </StrictMode>,
);