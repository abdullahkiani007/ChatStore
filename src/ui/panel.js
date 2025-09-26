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

const _browser =
  typeof globalThis.browser !== "undefined" ? globalThis.browser : chrome;

import deleteIcon from "@/icons/delete.png";

export function initPanel() {
  const theme = getTheme();

  function debounce(cb, wait = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(...args), wait);
    };
  }

  // floating logo toggle
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

  // main panel
  const panel = createEl("div", {
    id: "fav-extension-panel",
    style: {
      position: "fixed",
      bottom: "80px",
      right: "20px",
      width: "min(90vw, 320px)",
      maxHeight: "420px",
      background: theme.panelBg,
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: "16px",
      overflow: "hidden",
      display: "none",
      opacity: "0",
      transform: "translateY(20px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
      zIndex: "2147483647",
      color: theme.text,
      backdropFilter: "blur(10px)",
      flexDirection: "column", // Moved from inline style
    },
  });

  // sticky header + search container
  const topBar = createEl("div", {
    style: {
      position: "sticky",
      top: "0",
      background: theme.panelBg,
      padding: "12px 16px",
      borderBottom: `1px solid ${theme.panelBorder}`,
      zIndex: "1",
      flexShrink: "0", // Prevent shrinking
    },
  });

  const headerRow = createEl("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      fontWeight: "600",
    },
  });

  const title = createEl("div", { text: "Saved Chats" });
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
  headerRow.append(title, closeBtn);

  // Save button in its own container below header
  const saveContainer = createEl("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "12px",
    },
  });

  const saveBtn = createEl("button", {
    text: "＋ Save Current Chat",
    style: {
      border: `1px solid ${theme.panelBorder}`,
      background: theme.panelBg,
      color: theme.text,
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      padding: "8px 16px",
      borderRadius: "8px",
      width: "90%",
      transition: "background 0.2s",
    },
    attrs: { title: "Save current chat" },
  });

  // Add hover effect properly
  saveBtn.onmouseenter = () => {
    saveBtn.style.background = theme.hoverBg;
  };
  saveBtn.onmouseleave = () => {
    saveBtn.style.background = theme.panelBg;
  };

  saveBtn.onclick = async () => {
    const saved = await saveCurrentChat(
      document.title.replace(/\s*\|.*$/, ""),
      location.href
    );
    await loadFavorites(true);
    updateSaveButton();
    showToast("Chat saved!");
    await refresh();
  };

  saveContainer.appendChild(saveBtn);

  const searchBox = createEl("input", {
    attrs: { type: "search", placeholder: "Search by title…" },
    style: {
      width: "100%",
      padding: "6px 8px",
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: "8px",
      background: "rgba(0,0,0,0.05)",
      color: theme.text,
      fontSize: "14px",
    },
  });

  const list = createEl("ul", {
    style: {
      listStyle: "none",
      padding: "0",
      margin: "0",
      overflowY: "auto",
      flex: "1 1 auto",
      maxHeight: "none", // Let parent control height
    },
  });

  const noResults = createEl("div", {
    text: "No saved chats found.",
    style: {
      padding: "16px",
      textAlign: "center",
      fontSize: "13px",
      opacity: "0.7",
      display: "none",
    },
  });

  const footer = createEl("div", {
    text: "Click a chat to open it in a new tab.",
    style: {
      padding: "8px",
      fontSize: "12px",
      opacity: "0.7",
      textAlign: "center",
      borderTop: `1px solid ${theme.panelBorder}`,
      flexShrink: "0", // Prevent shrinking
    },
  });

  topBar.append(headerRow, saveContainer, searchBox);
  panel.append(topBar, list, noResults, footer);
  document.body.append(logo, panel);

  // --- logic functions ---
  function updateSaveButton() {
    const exists = state.filteredFavorites?.some(
      (f) => f.url === location.href
    );
    if (exists) {
      saveBtn.textContent = "✓ Saved";
      saveBtn.disabled = true;
      saveBtn.style.opacity = "0.6";
      saveBtn.title = "This chat is already saved";
    } else {
      saveBtn.textContent = "＋ Save Chat";
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
      saveBtn.title = "Save current chat";
    }
  }

  const doSearch = debounce(() => {
    applySearchFilter(searchBox.value);
    renderList(true);
  }, 250);
  searchBox.oninput = doSearch;

  async function refresh() {
    await loadFavorites(true);
    updateSaveButton();
    renderList(true);
  }

  function renderList(reset = false) {
    if (reset) {
      clearEl(list);
      state.renderedCount = 0; // Reset the counter
    }

    const batch = nextBatch();

    if (state.filteredFavorites.length === 0) {
      noResults.style.display = "block";
      list.style.display = "none";
    } else {
      noResults.style.display = "none";
      list.style.display = "block";
    }

    for (let i = batch.length - 1; i >= 0; i--) {
      const f = batch[i];
      const idx = state.renderedCount - batch.length + i;
      list.appendChild(renderItem(f, idx));
    }
  }

  function renderItem(f, idx) {
    const li = createEl("li", {
      style: {
        padding: "8px 12px",
        borderBottom: `1px solid ${theme.panelBorder}`,
        cursor: "pointer",
        transition: "background 0.2s",
      },
    });

    // Add hover effect
    li.onmouseenter = () => {
      li.style.background = "rgba(0,0,0,0.05)";
    };
    li.onmouseleave = () => {
      li.style.background = "transparent";
    };

    const titleRow = createEl("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
      },
    });

    const link = createEl("a", {
      text: f.title || f.url,
      attrs: {
        href: f.url,
        target: "_blank",
        rel: "noopener noreferrer",
        title: f.title || f.url, // Show full title on hover
      },
      style: {
        color: theme.text,
        textDecoration: "none",
        flex: "1",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "14px",
      },
    });

    const deleteBtn = createEl("img", {
      attrs: {
        src: deleteIcon,
        alt: "Delete",
        title: "Remove chat",
      },
      style: {
        width: "17px",
        height: "17px",
        cursor: "pointer",
        flexShrink: "0",
        display: "block",
        margin: "0 auto",
        transition: "transform 0.15s ease",
      },
    });

    // Delete button hover effect
    deleteBtn.onmouseenter = () => {
      deleteBtn.style.background = "rgba(0,0,0,0.1)";
    };
    deleteBtn.onmouseleave = () => {
      deleteBtn.style.background = "transparent";
    };

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm("Remove this chat?")) {
        await removeFavorite(idx);
        updateSaveButton();
        await refresh();
      }
    };
    console.log("date created", f);

    const ts = createEl("div", {
      text: f.date ? new Date(f.date).toLocaleString() : "unknown date",
      style: {
        fontSize: "11px",
        opacity: "0.6",
        marginTop: "2px",
      },
    });

    titleRow.append(link, deleteBtn);
    li.append(titleRow, ts);

    // Replace the existing li.onmouseenter with:
    li.onmouseenter = () => {
      li.style.borderLeft = "4px solid white"; // Thinner white line on the left
      li.style.paddingLeft = "8px"; // Adjust padding to compensate for border
      li.style.background = "rgba(0,0,0,0.05)"; // Keep the background effect
    };

    li.onmouseleave = () => {
      li.style.borderLeft = "none";
      li.style.paddingLeft = "12px"; // Reset to original padding
      li.style.background = "transparent";
    };
    // Make entire list item clickable
    li.onclick = (e) => {
      if (e.target !== deleteBtn && !deleteBtn.contains(e.target)) {
        window.open(f.url, "_blank");
      }
    };

    return li;
  }

  function show() {
    refresh();
    panel.style.display = "flex"; // Changed to flex
    requestAnimationFrame(() => {
      panel.style.opacity = "1";
      panel.style.transform = "translateY(0)";
    });
  }

  function hide() {
    panel.style.opacity = "0";
    panel.style.transform = "translateY(20px)";
    setTimeout(() => {
      panel.style.display = "none";
    }, 350);
  }

  logo.onclick = () => {
    if (panel.style.display === "none" || panel.style.display === "") {
      show();
    } else {
      hide();
    }
  };

  document.addEventListener("click", (e) => {
    if (
      panel.style.display !== "none" &&
      !panel.contains(e.target) &&
      e.target !== logo
    ) {
      hide();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.style.display !== "none") {
      hide();
    }
  });

  // Fix scroll event listener
  list.addEventListener("scroll", () => {
    const nearBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 50;
    if (nearBottom && state.renderedCount < state.filteredFavorites.length) {
      renderList(false);
    }
  });

  // Initial button state
  updateSaveButton();
}
