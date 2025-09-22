# Chat Store Extension

**Chat Store** is a browser extension that allows users to save, search, and manage their favorite chats from web applications. It provides a smooth UI panel for accessing saved chats, supports infinite scrolling, and is designed to work across modern browsers.

---

## Features

- **Save Chats**: Store the current chat with a single click.
- **Search**: Quickly filter chats by title or URL.
- **Lazy Loading**: Efficiently renders chats in batches as you scroll.
- **Remove Favorites**: Delete saved chats from the panel.
- **Responsive UI**: Works in both light and dark themes.
- **Cross-Browser**: Designed to be browser-agnostic. Currently, it works in Firefox; Chrome support may require minor adjustments due to differences in WebExtension APIs.
---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chat-store.git
cd chat-store
```
2. Load as an unpacked extension in your browser:
   - Chrome/Edge: chrome://extensions/ → “Load unpacked”
   - Firefox: about:debugging → “This Firefox” → “Load Temporary Add-on”


## Project Structure
```bash
chat-store/
├─ content.js          # Entry point for the extension
├─ ui/
│  ├─ panel.js         # Panel UI logic
│  ├─ dom.js           # DOM helpers
│  ├─ theme.js         # Theme settings
│  └─ toast.js         # Notifications
├─ features/
│  └─ favourites.js    # Chat save/load logic
├─ core/
│  ├─ state.js         # Application state
│  └─ storage.js       # Persistent storage helpers
├─ manifest.json       # WebExtension manifest
└─ README.md
```

## Usage
- Click the ★ logo button in the bottom-right corner of any page.
- Use Save This Chat to store the current chat.
- Use the search bar to filter saved chats by title.
- Click a chat to open it in a new tab.
- Remove chats by clicking the Remove button.

## Contributing

We welcome contributions! Please follow these guidelines:

#### 1. Code Style
- Use ES6+ syntax.
- Keep functions small and single-purpose.
- Use async/await for asynchronous operations.
- Maintain consistent indentation (2 spaces preferred).

#### 2. Project Architecture
- core/: State management and storage.
- features/: Business logic (e.g., favorites management).
- ui/: DOM rendering, theme, and panel components.
- Avoid tightly coupling logic and UI; separate concerns.

#### 3. Pull Requests
- Fork the repository and create a feature branch.
- Write clear commit messages.
- Ensure no runtime errors in console logs.
- Test across Chrome and Firefox.
- PRs should include a description of the change and screenshots if relevant.

#### 4. Best Practices
- Use descriptive variable names.
- Do not pollute the global namespace; use modules.
- Avoid blocking the UI on async operations.
- Debounce search input to avoid excessive rendering.
- Always clean up event listeners when removing DOM elements.

#### 5. Development Tips

- Use console.log for debugging during development.
- Use browser.storage.local for persistent state (cross-browser).
- Wrap DOM creation in utility functions (createEl, clearEl) for clarity.
- Always check window.__favChatsInjected to avoid double injection.

## Acknowledgements

- Inspired by extensions that improve productivity and chat management.
- Built using vanilla JavaScript and WebExtension APIs.