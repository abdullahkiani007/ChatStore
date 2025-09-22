import { getFavorites } from "./storage.js";

export const state = {
  allFavorites: [], // full list
  filteredFavorites: [], // after search filter
  renderedCount: 0, // how many items rendered
  PAGE_SIZE: 40,
};

export async function loadState() {
  const favs = await getFavorites();
  state.allFavorites = favs;
  state.filteredFavorites = favs;
  state.renderedCount = 0;
}

export function setFavorites(newFavs) {
  state.allFavorites = newFavs;
  state.filteredFavorites = newFavs;
  state.renderedCount = 0;
}
