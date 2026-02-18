
# LiveChat Supervisor - Extension Guide

## Installation Steps
1. Create a folder named `livechat-supervisor`.
2. Copy the logic from the components into the corresponding files:
   - `manifest.json`: Use V3 with permissions `["storage", "notifications", "tabs"]`.
   - `content.js`: Main entry point injected into the LiveChat URL.
   - `observer.js`: Exports a class that initiates `MutationObserver` on the message container.
   - `monitor.js`: Handles logic for keyword detection and timers.
   - `panel.js`: Injects the draggable HTML/CSS dashboard into the page DOM.
3. Open Chrome -> `chrome://extensions`.
4. Enable "Developer mode".
5. Click "Load unpacked" and select the folder.

## DOM Detection Logic
The extension relies on `MutationObserver`. Instead of polling with `setInterval` (which is performance-heavy), the observer reacts instantly when the chat interface adds a new DOM node:
```javascript
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      const node = mutation.addedNodes[0];
      if (node.classList?.contains('message-item')) {
         checkMessageContent(node);
      }
    }
  }
});
observer.observe(document.querySelector('.chat-history'), { childList: true });
```

## How to Modify Keywords Locally
Users can modify keywords through the `popup.html` interface or the floating panel settings. The keywords are stored in `chrome.storage.local`. Changes are broadcasted to the content script using:
```javascript
chrome.storage.onChanged.addListener((changes) => {
  if (changes.keywords) {
    currentKeywords = changes.keywords.newValue;
  }
});
```
