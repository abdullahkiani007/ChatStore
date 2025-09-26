// content.js
import { initPanel } from "./src/ui/panel";

// Wrap history methods ASAP
(function () {
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  function onUrlChange() {
    console.log("URL changed to", location.href);
    window.dispatchEvent(new Event("locationchange"));
  }

  history.pushState = function (...args) {
    const ret = origPush.apply(this, args);
    onUrlChange();
    return ret;
  };
  history.replaceState = function (...args) {
    const ret = origReplace.apply(this, args);
    onUrlChange();
    return ret;
  };
  window.addEventListener("popstate", onUrlChange);
})();

// Helper: defer UI init until body exists
function onBody(fn) {
  if (document.body) {
    fn();
  } else {
    window.addEventListener("DOMContentLoaded", fn);
  }
}

// Start once safe
if (!window.__favChatsInjected) {
  window.__favChatsInjected = true;
  onBody(() => {
    console.log("Favorite Chats extension loaded");
    initPanel();
  });
}
