// ui/panel.js
import { state } from "../core/state.js";
import {
  saveCurrentChat,
  loadFavorites,
  nextBatch,
  removeFavorite,
  applySearchFilter,
} from "../features/favourites.js";
import { createEl, clearEl } from "./dom.js";
import { getTheme } from "./theme.js";
import { showToast } from "./toast.js";
const deleteIcon = browser.runtime.getURL("icons/delete.png");

function debounce(cb, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb(...args);
    }, wait);
  };
}

export function initPanel() {
  console.log("Initializing panel....");
  const theme = getTheme();

  // logo
  const logo = createEl("button", {
    id: "fav-extension-logo",
    text: "★",
    style: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      background: theme.panelBg,
      border: "none",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      cursor: "pointer",
      zIndex: "2147483647",
    },
  });

  // panel
  const panel = createEl("div", {
    id: "fav-extension-panel",
    style: {
      position: "fixed",
      bottom: "80px",
      right: "20px",
      width: "320px",
      maxHeight: "420px",
      background: theme.panelBg,
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: "16px",
      padding: "16px",
      overflowY: "auto",
      backdropFilter: "blur(10px)",
      display: "none",
      opacity: "1",
      transform: "translateY(20px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      zIndex: "2147483647",
      color: theme.text,
    },
  });

  // header
  const header = createEl("div", {
    text: "Saved Chats",
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      fontWeight: "600",
    },
  });

  // close button
  const closeBtn = createEl("button", {
    text: "✕",
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: theme.text,
    },
  });
  closeBtn.onclick = hide;
  header.appendChild(closeBtn);

  // save button
  const saveBtn = createEl("button", {
    text: "💾 Save Chat",
    style: {
      border: "none",
      background: "#1E1E22", // professional blue accent
      color: "#fff",
      borderRadius: "8px",
      padding: "8px 16px",
      marginRight: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)", // subtle elevation
      transition: "all 0.15s ease",
    },
  });

  saveBtn.onmouseenter = () => {
    saveBtn.style.transform = "translateY(-1px)"; // slight lift
    saveBtn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.25)";
  };
  saveBtn.onmouseleave = () => {
    saveBtn.style.transform = "translateY(0)";
    saveBtn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
  };

  saveBtn.onclick = async () => {
    const saved = await saveCurrentChat(
      document.title.replace(/\s*\|.*$/, ""),
      location.href
    );
    showToast(saved ? "Chat saved!" : "Already saved");
    await refresh();
  };
  header.insertBefore(saveBtn, closeBtn);

  // search box
  const searchBox = createEl("input", {
    attrs: { type: "search", placeholder: "Search by title…" },
    style: {
      width: "100%",
      marginBottom: "8px",
      padding: "6px 8px",
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: "8px",
      background: "rgba(0,0,0,0.05)",
      color: theme.text,
      fontSize: "14px",
    },
  });
  searchBox.oninput = async () => {
    debounceSearch();
  };
  const debounceSearch = debounce(() => {
    applySearchFilter(searchBox.value);
    renderList(true);
  }, 300);

  // chat list
  const list = createEl("ul", {
    style: { listStyle: "none", padding: "0", margin: "0" },
  });

  // footer
  const footer = createEl("div", {
    text: "Click a chat to open it in a new tab.",
    style: {
      marginTop: "12px",
      fontSize: "12px",
      opacity: "0.7",
      textAlign: "center",
    },
  });

  panel.append(header, searchBox, list, footer);
  document.body.append(logo, panel);

  async function refresh() {
    console.log("refresh is beign fired...");
    await loadFavorites(true);
    renderList(true);
  }

  function renderList(reset = false) {
    if (reset) clearEl(list);
    const batch = nextBatch();
    for (let i = batch.length - 1; i >= 0; i--) {
      const f = batch[i];
      const idx = state.renderedCount - batch.length + i;
      list.appendChild(renderItem(f, idx));
    }
  }

  function renderItem(f, idx) {
    const li = createEl("li", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 6px",
        borderRadius: "6px",
        borderBottom: `1px solid ${theme.panelBorder}`,
        gap: "8px",
      },
    });
    li.onmouseenter = () => {
      li.style.background = "rgba(0,0,0,0.1)"; // or any subtle highlight
    };
    li.onmouseleave = () => {
      li.style.background = "transparent";
    };

    const link = createEl("a", {
      text: f.title || f.url,
      attrs: {
        href: f.url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: f.title || f.url, // <-- shows full text on hover
      },
      style: {
        color: theme.text,
        textDecoration: "none",
        fontSize: "small",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: "1 1 0",
        minWidth: "0",
      },
    });

    const deleteBtn = createEl("img", {
      attrs: {
        src: deleteIcon,
        alt: "Delete",
        title: "Remove chat",
      },
      style: {
        width: "20px",
        height: "20px",
        cursor: "pointer",
        flexShrink: "0",
        display: "block",
        margin: "0 auto",
        transition: "transform 0.15s ease",
      },
    });

    // Scale icon on hover
    deleteBtn.onmouseenter = () => {
      deleteBtn.style.transform = "scale(1.3)";
    };
    deleteBtn.onmouseleave = () => {
      deleteBtn.style.transform = "scale(1)";
    };

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      await removeFavorite(idx);
      await refresh();
    };

    li.append(link, deleteBtn);
    return li;
  }

  function show() {
    console.log("show is beign fired.....");
    refresh();
    panel.style.display = "block";
    requestAnimationFrame(() => {
      panel.style.opacity = "1";
      panel.style.transform = "translateY(0)";
    });
  }
  function hide() {
    panel.style.opacity = "0";
    panel.style.transform = "translateY(20px)";
    setTimeout(() => (panel.style.display = "none"), 250);
  }

  logo.onclick = () => (panel.style.display === "none" ? show() : hide());
  document.addEventListener("click", (e) => {
    if (
      panel.style.display === "block" &&
      !panel.contains(e.target) &&
      e.target !== logo
    )
      hide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });

  panel.addEventListener("scroll", () => {
    const nearBottom =
      panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 100;
    if (nearBottom && state.renderedCount < state.filteredFavorites.length) {
      renderList(false);
    }
  });
}
