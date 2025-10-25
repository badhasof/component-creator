// Background Service Worker
// Listens for keyboard commands and sends messages to content script

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-highlight') {
    // Send message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'toggle-selection-mode' }).catch(() => {
            // Ignore errors if content script not loaded in this tab
          });
        }
      });
    });
  }
});
