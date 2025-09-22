import { initPanel } from "./src/ui/panel";
// No top-level import — use dynamic import()
if (!window.__favChatsInjected) {
  window.__favChatsInjected = true;
  const _browser =
    typeof globalThis.browser !== "undefined" ? globalThis.browser : chrome;

  // browser.runtime.getURL ensures correct path in both Chrome & Firefox

  initPanel();
}
