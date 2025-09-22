document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("favList");
  const saveBtn = document.getElementById("saveBtn");
  const searchBox = document.getElementById("search");

  let allFavorites = [];
  let filtered = [];

  async function loadFavorites() {
    const { favorites = [] } = await browser.storage.local.get("favorites");
    // newest first
    allFavorites = [...favorites].reverse();
    applyFilter();
  }

  function applyFilter() {
    const term = searchBox.value.trim().toLowerCase();
    filtered = term
      ? allFavorites.filter((f) =>
          (f.title || f.url).toLowerCase().includes(term)
        )
      : allFavorites;
    renderList();
  }

  function renderList() {
    list.innerHTML = "";
    filtered.forEach((fav) => {
      const li = document.createElement("li");

      const link = document.createElement("a");
      link.href = fav.url;
      link.textContent = fav.title || fav.url;
      link.target = "_blank";

      const remove = document.createElement("button");
      remove.textContent = "✕";
      remove.title = "Remove";
      remove.addEventListener("click", async (e) => {
        e.preventDefault();
        const idx = allFavorites.findIndex((f) => f.url === fav.url);
        if (idx > -1) {
          allFavorites.splice(idx, 1);
          await browser.storage.local.set({
            favorites: [...allFavorites].reverse(),
          }); // store oldest-first
          applyFilter();
        }
      });

      li.appendChild(link);
      li.appendChild(remove);
      list.appendChild(li);
    });
  }

  saveBtn.addEventListener("click", async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const { favorites = [] } = await browser.storage.local.get("favorites");
    if (!favorites.some((f) => f.url === tab.url)) {
      favorites.push({ title: tab.title, url: tab.url });
      await browser.storage.local.set({ favorites });
      await loadFavorites();
    }
  });

  searchBox.addEventListener("input", applyFilter);

  loadFavorites();
});
