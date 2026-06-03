import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

function hideSplash() {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.classList.add("hidden");
    setTimeout(() => splash.remove(), 300);
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    hideSplash();
  } catch (e) {
    console.error("Failed to render app:", e);
    rootEl.innerHTML = `<div style="padding:20px;color:#f87171;background:hsl(220 15% 8%);min-height:100vh;font-family:monospace">
      <h2>启动失败</h2>
      <pre>${e instanceof Error ? e.message : String(e)}</pre>
    </div>`;
    hideSplash();
  }
}
