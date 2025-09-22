const _browser =
  typeof globalThis.browser !== "undefined" ? globalThis.browser : chrome;

_browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "openPopup") {
    _browser.tabs.create({ url: _browser.runtime.getURL("popup.html") });
  }
});
