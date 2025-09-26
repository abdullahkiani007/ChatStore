import { state } from "../core/state.js";
import { getFavorites, saveFavorites } from "../core/storage.js";

// Domain mapping for different chat services
const CHAT_DOMAINS = {
  chatgpt: ["chatgpt.com", "chat.openai.com"],
  claude: ["claude.ai"],
  gemini: ["gemini.google.com"],
  deepseek: ["chat.deepseek.com"],
};

// Helper function to get current site domain
function getCurrentSiteDomain() {
  const hostname = window.location.hostname;

  for (const [service, domains] of Object.entries(CHAT_DOMAINS)) {
    if (domains.some((domain) => hostname.includes(domain))) {
      return service;
    }
  }
  return "all"; // Return 'all' if not on a recognized chat domain
}

export async function loadFavorites(reset = true, filterByCurrentSite = true) {
  console.log("loading favs....");
  const favorites = await getFavorites();

  if (reset) {
    state.allFavorites = favorites;
    state.renderedCount = 0;

    if (filterByCurrentSite) {
      // Auto-apply current site filter
      const currentSite = getCurrentSiteDomain();
      applySiteFilter(currentSite);
    } else {
      applySearchFilter("");
    }
  }
}

export function applySiteFilter(site) {
  if (site === "all") {
    state.filteredFavorites = state.allFavorites;
  } else {
    const domains = CHAT_DOMAINS[site] || [];
    state.filteredFavorites = state.allFavorites.filter((f) =>
      domains.some((domain) => f.url.includes(domain))
    );
  }
  state.renderedCount = 0;
}

export function applySearchFilter(term) {
  const t = term.trim().toLowerCase();
  const currentSite = getCurrentSiteDomain();

  let filtered = state.allFavorites;

  // First apply site filter if not on 'all' sites
  if (currentSite !== "all") {
    const domains = CHAT_DOMAINS[currentSite] || [];
    filtered = filtered.filter((f) =>
      domains.some((domain) => f.url.includes(domain))
    );
  }

  // Then apply search term filter
  state.filteredFavorites = !t
    ? filtered
    : filtered.filter((f) => (f.title || f.url).toLowerCase().includes(t));

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
    let date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    date = date.toISOString().slice(0, 16).replace("T", " ");
    favorites.push({ title, url, date });
    await saveFavorites(favorites);
    return true;
  }
  return false;
}

export async function removeFavorite(idx) {
  state.allFavorites.splice(idx, 1);
  await saveFavorites(state.allFavorites);
}

// Helper function to get the current filter state
export function getCurrentFilter() {
  return getCurrentSiteDomain();
}

// Function to clear site filter and show all chats
export function clearSiteFilter() {
  applySearchFilter("");
}
