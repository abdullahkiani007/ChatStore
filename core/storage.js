// core/storage.js
export async function getFavorites() {
  const { favorites = [] } = await browser.storage.local.get("favorites");
  return favorites;
}

export async function setFavorites(favs) {
  return browser.storage.local.set({ favorites: favs });
}
