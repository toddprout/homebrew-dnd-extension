/**
 * Homebrew DND Quick Reference - Background Service Worker
 * Handles keyboard shortcuts, side panel management, and extension events
 */

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_side_panel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  }
});

// ============================================
// MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Open side panel from popup
  if (message.action === 'openSidePanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
  
  // Central dice rolling for consistency across popup and sidepanel
  if (message.action === 'rollDice') {
    const { sides, count = 1 } = message;
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    sendResponse({ rolls, total });
    return true;
  }
});

// ============================================
// INSTALLATION & SETUP
// ============================================

chrome.runtime.onInstalled.addListener((details) => {
  // Set up context menus
  chrome.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open DM Reference Panel',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'searchSelection',
    title: 'Search Homebrew DND for "%s"',
    contexts: ['selection']
  });
  
  // Configure side panel behavior
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.error('Error setting panel behavior:', error));
  
  // Set default storage on first install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      favorites: [],
      recentSearches: [],
      preferences: {
        defaultView: 'search',
        theme: 'dark',
        diceAnimation: true
      }
    });
    console.log('Homebrew DND Quick Reference installed!');
  }
  
  if (details.reason === 'update') {
    console.log(`Updated to version ${chrome.runtime.getManifest().version}`);
  }
});

// ============================================
// CONTEXT MENU HANDLERS
// ============================================

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    chrome.sidePanel.open({ tabId: tab.id });
  }
  
  if (info.menuItemId === 'searchSelection' && info.selectionText) {
    // Open side panel and send search query
    chrome.sidePanel.open({ tabId: tab.id });
    
    // Brief delay to ensure panel is ready
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'searchFromContext',
        query: info.selectionText.trim()
      });
    }, 300);
  }
});
