import { state } from "../core/state.js";
import { getFavorites, saveFavorites } from "../core/storage.js";

export async function loadFavorites(reset = true) {
  console.log("loading favourite...");
  const favorites = await getFavorites();
  if (reset) {
    state.allFavorites = favorites;
    state.renderedCount = 0;
    applySearchFilter("");
  }
  // return nextBatch();
}

export function applySearchFilter(term) {
  const t = term.trim().toLowerCase();
  state.filteredFavorites = !t
    ? state.allFavorites
    : state.allFavorites.filter((f) =>
        (f.title || f.url).toLowerCase().includes(t)
      );
  state.renderedCount = 0;
}

export function nextBatch() {
  const slice = state.filteredFavorites.slice(
    state.renderedCount,
    state.renderedCount + state.PAGE_SIZE
  );
  state.renderedCount += slice.length;
  return slice;
}

export async function saveCurrentChat(title, url) {
  const favorites = await getFavorites();
  if (!favorites.some((f) => f.url === url)) {
    favorites.push({ title, url });
    await saveFavorites(favorites);
    return true;
  }
  return false;
}

export async function removeFavorite(idx) {
  state.allFavorites.splice(idx, 1);
  await saveFavorites(state.allFavorites);
}
