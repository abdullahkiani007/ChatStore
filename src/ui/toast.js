// ui/toast.js
import { createEl } from "./dom.js";
import { getTheme } from "./theme.js";

export function showToast(message) {
  const theme = getTheme();
  const toast = createEl("div", {
    text: message,
    style: {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: theme.panelBg,
      backdropFilter: "blur(10px)",
      color: theme.text,
      padding: "10px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      opacity: "0",
      transition: "opacity 0.3s ease",
      zIndex: "2147483647",
    },
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = "1"));
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}
