// ui/theme.js
export function getTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return {
    panelBg: isDark ? "rgba(32,32,36,0.85)" : "rgba(255,255,255,0.8)",
    panelBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    text: isDark ? "#f0f0f0" : "#222",
    hoverBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
  };
}
