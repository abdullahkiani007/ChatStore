export async function getFavorites() {
  const { favorites = [] } = await browser.storage.local.get("favorites");
  return favorites;
}

export async function saveFavorites(favs) {
  return browser.storage.local.set({ favorites: favs });
}
