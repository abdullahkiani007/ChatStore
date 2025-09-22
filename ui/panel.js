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

export function initPanel() {
  console.log("Initializing panel....");
  const theme = getTheme();

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
    applySearchFilter(searchBox.value);
    renderList(true);
  };

  const list = createEl("ul", {
    style: { listStyle: "none", padding: "0", margin: "0" },
  });
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
      console.log("rendering list");
      list.appendChild(renderItem(f, idx));
    }
  }

  function renderItem(f, idx) {
    const li = createEl("li", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
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
      },
      style: {
        color: theme.text,
        textDecoration: "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        flex: "1 1 auto",
      },
    });
    const removeBtn = createEl("button", {
      text: "Remove",
      style: {
        minWidth: "70px", // minimum width for consistency
        flexShrink: "0", // don't shrink
        border: `1px solid ${theme.panelBorder}`,
        background: "transparent",
        color: "crimson",
        borderRadius: "6px",
        padding: "4px 8px", // add horizontal padding
        fontSize: "12px",
        cursor: "pointer",
        textAlign: "center", // ensures text is centered
      },
    });

    removeBtn.onclick = async (e) => {
      e.stopPropagation();
      await removeFavorite(idx);
      await refresh();
    };
    removeBtn.onmouseenter = () => {
      removeBtn.style.background = "crimson";
      removeBtn.style.color = "white";
    };
    removeBtn.onmouseleave = () => {
      removeBtn.style.background = "transparent";
      removeBtn.style.color = "crimson";
    };

    li.append(link, removeBtn);
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
