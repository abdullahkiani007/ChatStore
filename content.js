// No top-level import — use dynamic import()
if (!window.__favChatsInjected) {
  window.__favChatsInjected = true;

  // browser.runtime.getURL ensures correct path in both Chrome & Firefox
  import(browser.runtime.getURL("ui/panel.js"))
    .then(({ initPanel }) => initPanel())
    .catch((err) => console.error("Failed to load panel module", err));
}

// // ==== Config ====
// const PAGE_SIZE = 40; // how many chats to render per batch
// let renderedCount = 0; // tracks how many we have drawn so far
// let allFavorites = []; // cache to avoid reloading every scroll
// let filteredFavorites = []; // subset shown after search

// console.log("Loading content.js rararararar ");

// // content.js — elegant saved-chats UI
// if (!window.__favChatsInjected) {
//   window.__favChatsInjected = true;
//   console.log("Injecting refined Fav-Chats UI…");

//   // --- Utility: Theme colors based on system preference ---
//   const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//   const theme = {
//     panelBg: isDark ? "rgba(32, 32, 36, 0.8)" : "rgba(255, 255, 255, 0.8)",
//     panelBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
//     text: isDark ? "#f0f0f0" : "#222",
//     hoverBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
//   };

//   // --- Logo button ---
//   const logo = document.createElement("button");
//   logo.id = "fav-extension-logo";
//   logo.setAttribute("aria-label", "Show saved chats");
//   Object.assign(logo.style, {
//     position: "fixed",
//     bottom: "20px",
//     right: "20px",
//     width: "48px",
//     height: "48px",
//     borderRadius: "12px",
//     border: "none",
//     background: theme.panelBg,
//     backdropFilter: "blur(10px) saturate(180%)",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
//     cursor: "pointer",
//     zIndex: "2147483647",
//     padding: "0",
//     transition: "transform 0.15s ease",
//   });
//   logo.innerHTML = "★"; // you can swap for an <img> if desired
//   logo.addEventListener(
//     "mouseenter",
//     () => (logo.style.transform = "scale(1.05)")
//   );
//   logo.addEventListener(
//     "mouseleave",
//     () => (logo.style.transform = "scale(1)")
//   );
//   document.body.appendChild(logo);

//   // --- Panel container ---
//   const panel = document.createElement("div");
//   panel.id = "fav-extension-panel";
//   Object.assign(panel.style, {
//     position: "fixed",
//     bottom: "80px",
//     right: "20px",
//     width: "320px",
//     maxHeight: "420px",
//     background: theme.panelBg,
//     backdropFilter: "blur(12px) saturate(180%)",
//     border: `1px solid ${theme.panelBorder}`,
//     borderRadius: "16px",
//     boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
//     color: theme.text,
//     fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
//     fontSize: "14px",
//     padding: "16px",
//     overflowY: "auto",
//     display: "none",
//     opacity: "0",
//     transform: "translateY(20px)",
//     transition: "opacity 0.25s ease, transform 0.25s ease",
//     zIndex: "2147483647",
//   });
//   document.body.appendChild(panel);

//   function showToast(message) {
//     const toast = document.createElement("div");
//     toast.textContent = message;
//     Object.assign(toast.style, {
//       position: "fixed",
//       bottom: "20px",
//       left: "50%",
//       transform: "translateX(-50%)",
//       background: theme.panelBg,
//       backdropFilter: "blur(10px)",
//       color: theme.text,
//       padding: "10px 16px",
//       borderRadius: "8px",
//       boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
//       fontSize: "14px",
//       zIndex: "2147483647",
//       opacity: "0",
//       transition: "opacity 0.3s ease",
//     });
//     document.body.appendChild(toast);
//     requestAnimationFrame(() => (toast.style.opacity = "1"));
//     setTimeout(() => {
//       toast.style.opacity = "0";
//       setTimeout(() => toast.remove(), 300);
//     }, 1500);
//   }

//   // Header
//   const header = document.createElement("div");
//   Object.assign(header.style, {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "12px",
//     fontWeight: "600",
//   });
//   header.textContent = "Saved Chats";

//   const closeBtn = document.createElement("button");
//   closeBtn.textContent = "✕";
//   Object.assign(closeBtn.style, {
//     background: "transparent",
//     border: "none",
//     cursor: "pointer",
//     fontSize: "18px",
//     color: theme.text,
//   });
//   closeBtn.addEventListener("click", hidePanel);
//   header.appendChild(closeBtn);
//   panel.appendChild(header);

//   // === Save Current Chat button ===
//   const saveBtn = document.createElement("button");
//   saveBtn.textContent = "Save This Chat";
//   Object.assign(saveBtn.style, {
//     border: `1px solid ${theme.panelBorder}`,
//     background: "transparent",
//     borderRadius: "8px",
//     padding: "6px 12px",
//     marginLeft: "auto",
//     marginRight: "8px",
//     cursor: "pointer",
//     fontSize: "13px",
//     color: theme.text,
//   });
//   saveBtn.addEventListener("click", async () => {
//     // Retrieve current list
//     const res = await browser.storage.local.get("favorites");
//     const favorites = res.favorites || [];
//     let filteredFavorites = []; // subset shown after search

//     // Current page info
//     const chatTitle = document.title.replace(/\s*\|.*$/, ""); // trim extra stuff
//     const chatUrl = window.location.href;

//     // Avoid duplicates
//     if (!favorites.some((f) => f.url === chatUrl)) {
//       favorites.push({ title: chatTitle, url: chatUrl });
//       await browser.storage.local.set({ favorites });
//       showToast("Chat saved!");
//       await loadFavorites();
//     } else {
//       showToast("Already saved");
//     }
//   });

//   // insert Save button between title and closeBtn
//   header.insertBefore(saveBtn, closeBtn);

//   // === Search Box ===
//   const searchBox = document.createElement("input");
//   Object.assign(searchBox.style, {
//     width: "100%",
//     marginBottom: "8px",
//     padding: "6px 8px",
//     border: `1px solid ${theme.panelBorder}`,
//     borderRadius: "8px",
//     background: isDark ? "rgba(0,0,0,0.2)" : "#fff",
//     color: theme.text,
//     fontSize: "14px",
//     outline: "none",
//   });
//   searchBox.type = "search";
//   searchBox.placeholder = "Search by title…";

//   // List container
//   const list = document.createElement("ul");
//   Object.assign(list.style, {
//     listStyle: "none",
//     padding: "0",
//     margin: "0",
//   });
//   panel.appendChild(list);
//   panel.insertBefore(searchBox, list);

//   // Footer hint
//   const footer = document.createElement("div");
//   footer.textContent = "Click a chat to open it in a new tab.";
//   Object.assign(footer.style, {
//     marginTop: "12px",
//     fontSize: "12px",
//     opacity: "0.7",
//     textAlign: "center",
//   });
//   panel.appendChild(footer);

//   //   // Load favorites from storage
//   async function loadFavorites(reset = true) {
//     let mockData = [];
//     // for (let i = 0; i < 400; i++) {
//     //   mockData.push({
//     //     title: `Mock Chat ${i + 1}`,
//     //     url: `https://example.com/chat/${i + 1}`,
//     //   });
//     // }
//     const { favorites = [] } = await browser.storage.local.get("favorites");
//     if (reset) {
//       allFavorites = favorites;
//       renderedCount = 0;
//       applySearchFilter(); // refresh filteredFavorites
//       list.innerHTML = ""; // clear existing DOM
//     }
//     appendNextBatch(); // draw first (or next) page
//   }

//   function applySearchFilter() {
//     const term = searchBox.value.trim().toLowerCase();
//     if (!term) {
//       filteredFavorites = allFavorites;
//     } else {
//       filteredFavorites = allFavorites.filter((f) =>
//         (f.title || f.url).toLowerCase().includes(term)
//       );
//     }
//     renderedCount = 0;
//     list.innerHTML = "";
//   }
//   function appendNextBatch() {
//     const slice = filteredFavorites.slice(
//       renderedCount,
//       renderedCount + PAGE_SIZE
//     );
//     // reverse order to show newest first
//     for (let i = slice.length - 1; i >= 0; i--) {
//       const f = slice[i];
//       const globalIdx = renderedCount + i;
//       list.appendChild(renderItem(f, globalIdx));
//     }

//     renderedCount += slice.length;
//   }

//   // Factor item creation into a helper
//   function renderItem(f, idx) {
//     const li = document.createElement("li");
//     Object.assign(li.style, {
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       padding: "6px 0",
//       borderBottom: `1px solid ${theme.panelBorder}`,
//       gap: "8px",
//     });

//     const linkWrap = document.createElement("div");
//     Object.assign(linkWrap.style, {
//       flex: "1 1 auto",
//       minWidth: "0",
//       padding: "6px 8px",
//       borderRadius: "6px",
//       transition: "background 0.2s",
//       cursor: "pointer",
//       display: "flex",
//       alignItems: "center",
//     });

//     const link = document.createElement("a");
//     link.href = f.url;
//     link.textContent = f.title || f.url;
//     link.target = "_blank";
//     link.rel = "noopener noreferrer";
//     Object.assign(link.style, {
//       color: theme.text,
//       textDecoration: "none",
//       overflow: "hidden",
//       textOverflow: "ellipsis",
//       whiteSpace: "nowrap",
//       flex: "1 1 auto",
//     });

//     linkWrap.addEventListener(
//       "mouseenter",
//       () => (linkWrap.style.background = theme.hoverBg)
//     );
//     linkWrap.addEventListener(
//       "mouseleave",
//       () => (linkWrap.style.background = "transparent")
//     );
//     linkWrap.appendChild(link);

//     const remove = document.createElement("button");
//     remove.textContent = "Remove";
//     Object.assign(remove.style, {
//       flex: "0 0 auto",
//       width: "70px",
//       border: `1px solid ${theme.panelBorder}`,
//       background: "transparent",
//       color: "crimson",
//       borderRadius: "6px",
//       padding: "4px 0",
//       fontSize: "12px",
//       cursor: "pointer",
//       textAlign: "center",
//       transition: "background 0.2s",
//     });

//     remove.addEventListener(
//       "mouseenter",
//       () => (remove.style.background = "rgba(220,20,60,0.1)")
//     );
//     remove.addEventListener(
//       "mouseleave",
//       () => (remove.style.background = "transparent")
//     );

//     remove.addEventListener("click", async (e) => {
//       e.stopPropagation();
//       allFavorites.splice(idx, 1);
//       await browser.storage.local.set({ favorites: allFavorites });
//       await loadFavorites(true); // reload from scratch to update DOM
//     });

//     li.appendChild(linkWrap);
//     li.appendChild(remove);
//     return li;
//   }

//   // === Infinite scroll listener ===
//   panel.addEventListener("scroll", () => {
//     const nearBottom =
//       panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 100;
//     if (nearBottom && renderedCount < filteredFavorites.length) {
//       appendNextBatch();
//     }
//   });
//   searchBox.addEventListener("input", () => {
//     console.log("applying search filter...");
//     applySearchFilter();
//     appendNextBatch(); // draw first page of filtered results
//   });

//   // Show/Hide with animation
//   async function showPanel() {
//     await loadFavorites();
//     panel.style.display = "block";
//     requestAnimationFrame(() => {
//       panel.style.opacity = "1";
//       panel.style.transform = "translateY(0)";
//     });
//   }
//   function hidePanel() {
//     panel.style.opacity = "0";
//     panel.style.transform = "translateY(20px)";
//     setTimeout(() => (panel.style.display = "none"), 250);
//   }

//   logo.addEventListener("click", () =>
//     panel.style.display === "none" ? showPanel() : hidePanel()
//   );

//   // Close when clicking outside
//   document.addEventListener("click", (e) => {
//     if (
//       panel.style.display === "block" &&
//       !panel.contains(e.target) &&
//       e.target !== logo
//     ) {
//       hidePanel();
//     }
//   });
//   document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape" && panel.style.display === "block") hidePanel();
//   });
// }
