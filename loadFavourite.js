export async function loadFavorites(reset = true) {
  const { favorites = [] } = await browser.storage.local.get("favorites");
  if (reset) {
    allFavorites = favorites;
    renderedCount = 0;
    list.innerHTML = ""; // clear existing DOM
  }
  appendNextBatch(); // draw first (or next) page
}

function appendNextBatch() {
  const slice = allFavorites.slice(renderedCount, renderedCount + PAGE_SIZE);
  slice.forEach((f, idx) => {
    const globalIdx = renderedCount + idx;
    list.appendChild(renderItem(f, globalIdx));
  });
  renderedCount += slice.length;
}

// Factor item creation into a helper
function renderItem(f, idx) {
  const li = document.createElement("li");
  Object.assign(li.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: `1px solid ${theme.panelBorder}`,
    gap: "8px",
  });

  const linkWrap = document.createElement("div");
  Object.assign(linkWrap.style, {
    flex: "1 1 auto",
    minWidth: "0",
    padding: "6px 8px",
    borderRadius: "6px",
    transition: "background 0.2s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  });

  const link = document.createElement("a");
  link.href = f.url;
  link.textContent = f.title || f.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  Object.assign(link.style, {
    color: theme.text,
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: "1 1 auto",
  });

  linkWrap.addEventListener(
    "mouseenter",
    () => (linkWrap.style.background = theme.hoverBg)
  );
  linkWrap.addEventListener(
    "mouseleave",
    () => (linkWrap.style.background = "transparent")
  );
  linkWrap.appendChild(link);

  const remove = document.createElement("button");
  remove.textContent = "Remove";
  Object.assign(remove.style, {
    flex: "0 0 auto",
    width: "70px",
    border: `1px solid ${theme.panelBorder}`,
    background: "transparent",
    color: "crimson",
    borderRadius: "6px",
    padding: "4px 0",
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background 0.2s",
  });

  remove.addEventListener(
    "mouseenter",
    () => (remove.style.background = "rgba(220,20,60,0.1)")
  );
  remove.addEventListener(
    "mouseleave",
    () => (remove.style.background = "transparent")
  );

  remove.addEventListener("click", async (e) => {
    e.stopPropagation();
    allFavorites.splice(idx, 1);
    await browser.storage.local.set({ favorites: allFavorites });
    await loadFavorites(true); // reload from scratch to update DOM
  });

  li.appendChild(linkWrap);
  li.appendChild(remove);
  return li;
}

// === Infinite scroll listener ===
panel.addEventListener("scroll", () => {
  const nearBottom =
    panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 100;
  if (nearBottom && renderedCount < allFavorites.length) {
    appendNextBatch();
  }
});
