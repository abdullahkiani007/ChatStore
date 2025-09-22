const _browser =
  typeof globalThis.browser !== "undefined" ? globalThis.browser : chrome;

export async function getFavorites() {
  const { favorites = [] } = await _browser.storage.local.get("favorites");
  return favorites;
}

export async function saveFavorites(favs) {
  return _browser.storage.local.set({ favorites: favs });
}
