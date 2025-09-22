// No top-level import — use dynamic import()
if (!window.__favChatsInjected) {
  window.__favChatsInjected = true;

  // browser.runtime.getURL ensures correct path in both Chrome & Firefox
  import(browser.runtime.getURL("ui/panel.js"))
    .then(({ initPanel }) => initPanel())
    .catch((err) => console.error("Failed to load panel module", err));
}
