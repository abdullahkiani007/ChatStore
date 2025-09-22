browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "openPopup") {
    browser.tabs.create({ url: browser.runtime.getURL("popup.html") });
  }
});
