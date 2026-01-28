/**
 * Homebrew DND Quick Reference - Popup Script
 * Handles search, dice rolling, and quick table access
 */

// ============================================
// STATE
// ============================================

let allData = null;
let currentTableType = null;
let diceHistory = [];
let quickNPC = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load all data
  allData = await window.HomebrewDND.loadAllData();
  
  // Initialize components
  initSearch();
  initDiceRoller();
  initQuickLinks();
  initTableResult();
  initOpenPanel();
  initQuickNPC();
});

// ============================================
// SEARCH
// ============================================

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  // Debounced search
  const debouncedSearch = window.HomebrewDND.debounce((query) => {
    performSearch(query);
  }, 200);
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length === 0) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }
    
    if (query.length >= 2) {
      debouncedSearch(query);
    }
  });
  
  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      searchResults.classList.remove('active');
    }
  });
  
  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });
}

function performSearch(query) {
  const searchResults = document.getElementById('searchResults');
  
  if (!allData) {
    searchResults.innerHTML = '<div class="search-no-results">Loading data...</div>';
    searchResults.classList.add('active');
    return;
  }
  
  const results = window.HomebrewDND.searchAllData(allData, query);
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No items found</div>';
    searchResults.classList.add('active');
    return;
  }
  
  // Limit to 10 results in popup
  const limitedResults = results.slice(0, 10);
  
  searchResults.innerHTML = limitedResults.map(({ category, categoryName, item }) => {
    const price = item.cost || item.price || '';
    return `
      <div class="search-result-item" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}' data-category="${category}">
        <span class="search-result-name">${escapeHtml(item.name)}</span>
        <span class="search-result-category">${escapeHtml(categoryName)}</span>
        ${price ? `<span class="search-result-price">${escapeHtml(price)}</span>` : ''}
      </div>
    `;
  }).join('');
  
  searchResults.classList.add('active');
  
  // Add click handlers to results
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const itemData = JSON.parse(item.dataset.item);
      const category = item.dataset.category;
      showItemDetail(itemData, category);
      
      // Save to recent searches
      window.HomebrewDND.addRecentSearch(document.getElementById('searchInput').value.trim());
    });
  });
}

function showItemDetail(item, category) {
  // For popup, we'll show a simple alert-style detail
  // The full side panel has a more detailed view
  
  let details = `${item.name}\n`;
  details += `Category: ${window.HomebrewDND.formatCategoryName(category)}\n`;
  
  if (item.cost || item.price) {
    details += `Cost: ${item.cost || item.price}\n`;
  }
  if (item.weight) {
    details += `Weight: ${window.HomebrewDND.formatWeight(item.weight)}\n`;
  }
  if (item.damage) {
    details += `Damage: ${item.damage}\n`;
  }
  if (item.ac || item.armor_class) {
    details += `AC: ${item.ac || item.armor_class}\n`;
  }
  if (item.properties) {
    details += `Properties: ${Array.isArray(item.properties) ? item.properties.join(', ') : item.properties}\n`;
  }
  if (item.description) {
    details += `\n${item.description}`;
  }
  
  // Create a detail overlay similar to table results
  showItemOverlay(item, category);
}

function showItemOverlay(item, category) {
  // Check if overlay already exists
  let overlay = document.querySelector('.item-detail-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'item-detail-overlay';
    overlay.innerHTML = `
      <div class="item-detail-card">
        <div class="item-detail-header">
          <span class="item-detail-name"></span>
          <button class="btn-icon close-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="item-detail-content"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Close handlers
    overlay.querySelector('.close-btn').addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }
  
  // Populate content
  overlay.querySelector('.item-detail-name').textContent = item.name;
  
  let contentHtml = `
    <div class="item-detail-row">
      <span class="item-detail-label">Category</span>
      <span class="item-detail-value">${window.HomebrewDND.formatCategoryName(category)}</span>
    </div>
  `;
  
  if (item.cost || item.price) {
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Cost</span>
        <span class="item-detail-value price">${item.cost || item.price}</span>
      </div>
    `;
  }
  
  if (item.weight) {
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Weight</span>
        <span class="item-detail-value">${window.HomebrewDND.formatWeight(item.weight)}</span>
      </div>
    `;
  }
  
  if (item.damage) {
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Damage</span>
        <span class="item-detail-value">${item.damage}</span>
      </div>
    `;
  }
  
  if (item.damage_type) {
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Damage Type</span>
        <span class="item-detail-value">${item.damage_type}</span>
      </div>
    `;
  }
  
  if (item.ac || item.armor_class) {
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Armor Class</span>
        <span class="item-detail-value">${item.ac || item.armor_class}</span>
      </div>
    `;
  }
  
  if (item.properties) {
    const props = Array.isArray(item.properties) ? item.properties.join(', ') : item.properties;
    contentHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Properties</span>
        <span class="item-detail-value">${props}</span>
      </div>
    `;
  }
  
  if (item.description) {
    contentHtml += `
      <div class="item-detail-row" style="flex-direction: column; gap: 4px;">
        <span class="item-detail-label">Description</span>
        <span class="item-detail-value" style="font-weight: normal;">${escapeHtml(item.description)}</span>
      </div>
    `;
  }
  
  overlay.querySelector('.item-detail-content').innerHTML = contentHtml;
  overlay.classList.add('active');
  
  // Close search results
  document.getElementById('searchResults').classList.remove('active');
}

// ============================================
// DICE ROLLER
// ============================================

function initDiceRoller() {
  const diceButtons = document.querySelectorAll('.dice-btn');
  
  diceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sides = parseInt(btn.dataset.sides);
      rollDice(sides);
    });
  });
}

function rollDice(sides) {
  const diceResult = document.getElementById('diceResult');
  
  // Roll animation
  diceResult.classList.add('rolling');
  
  // Quick number animation
  let animationCount = 0;
  const animationInterval = setInterval(() => {
    diceResult.textContent = Math.floor(Math.random() * sides) + 1;
    animationCount++;
    if (animationCount > 5) {
      clearInterval(animationInterval);
      
      // Final roll
      const result = window.HomebrewDND.rollDie(sides);
      diceResult.textContent = result;
      diceResult.classList.remove('rolling');
      
      // Add to history
      diceHistory.unshift({ sides, result });
      if (diceHistory.length > 5) diceHistory.pop();
      
      // Update history display
      updateDiceHistory();
    }
  }, 50);
}

function updateDiceHistory() {
  const diceHistoryEl = document.getElementById('diceHistory');
  
  if (diceHistory.length === 0) {
    diceHistoryEl.textContent = '';
    return;
  }
  
  const historyText = diceHistory
    .slice(0, 5)
    .map(({ sides, result }) => `d${sides}:${result}`)
    .join(' · ');
  
  diceHistoryEl.textContent = historyText;
}

// ============================================
// QUICK LINKS (Table Rolls)
// ============================================

function initQuickLinks() {
  const quickLinkButtons = document.querySelectorAll('.quick-link-btn');
  
  quickLinkButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tableType = btn.dataset.table;
      rollOnTable(tableType);
    });
  });
}

async function rollOnTable(tableType) {
  currentTableType = tableType;
  
  // Load table data if not already loaded
  if (!allData) {
    allData = await window.HomebrewDND.loadAllData();
  }
  
  const tableData = allData[tableType];
  
  // Handle both 'items' and 'entries' keys for table data
  const tableEntries = tableData?.items || tableData?.entries;
  
  if (!tableData || !tableEntries) {
    console.error(`Table data not found for: ${tableType}`);
    return;
  }
  
  // Roll on the table
  const { roll, result } = window.HomebrewDND.rollOnTable(tableEntries);
  
  // Show result
  showTableResult(tableType, roll, result);
}

function showTableResult(tableType, roll, result) {
  const overlay = document.getElementById('tableResultOverlay');
  const title = document.getElementById('tableResultTitle');
  const rollValue = document.getElementById('tableRollValue');
  const resultText = document.getElementById('tableResultText');
  
  // Format table name
  const tableNames = {
    trinkets: 'Trinket',
    wild_magic: 'Wild Magic Surge',
    tavern_drinks: 'Tavern Drink',
    npc_quirks: 'NPC Quirk',
    loot: 'Loot & Treasure',
    tavern_events: 'Tavern Event',
    weather: 'Weather',
    dungeon_dressing: 'Dungeon Dressing',
    corpse_pockets: 'Corpse Pockets'
  };
  
  title.textContent = tableNames[tableType] || window.HomebrewDND.formatCategoryName(tableType);
  rollValue.textContent = roll.toString().padStart(2, '0');
  
  // Handle different result formats
  let displayText = '';
  if (typeof result === 'string') {
    displayText = result;
  } else if (result.name && result.effect) {
    // Tavern drinks have name + effect
    displayText = `${result.name}${result.price ? ` (${result.price})` : ''}\n\n${result.effect}`;
  } else if (result.result) {
    displayText = result.result;
  } else if (result.description) {
    displayText = result.description;
  } else if (result.effect) {
    displayText = result.effect;
  } else if (result.name) {
    displayText = result.name;
  } else {
    displayText = JSON.stringify(result);
  }
  
  resultText.textContent = displayText;
  
  // Show overlay
  overlay.classList.add('active');
}

function initTableResult() {
  const overlay = document.getElementById('tableResultOverlay');
  const closeBtn = document.getElementById('closeTableResult');
  const rerollBtn = document.getElementById('rerollBtn');
  const manualRollInput = document.getElementById('manualRollInput');
  const manualRollBtn = document.getElementById('manualRollBtn');
  
  // Close button
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
  
  // Reroll button
  rerollBtn.addEventListener('click', () => {
    if (currentTableType) {
      rollOnTable(currentTableType);
    }
  });
  
  // Manual roll lookup
  manualRollBtn.addEventListener('click', () => {
    lookupManualRoll();
  });
  
  manualRollInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      lookupManualRoll();
    }
  });
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });
}

async function lookupManualRoll() {
  const manualRollInput = document.getElementById('manualRollInput');
  const roll = parseInt(manualRollInput.value);
  
  if (isNaN(roll) || roll < 1 || roll > 100) {
    manualRollInput.classList.add('error');
    setTimeout(() => manualRollInput.classList.remove('error'), 500);
    return;
  }
  
  if (!currentTableType) return;
  
  // Load data if needed
  if (!allData) {
    allData = await window.HomebrewDND.loadAllData();
  }
  
  const tableData = allData[currentTableType];
  const tableEntries = tableData?.items || tableData?.entries;
  
  if (!tableEntries) return;
  
  // Find the result for this roll
  const result = tableEntries.find(entry => {
    if (typeof entry.roll === 'number') {
      return entry.roll === roll;
    }
    if (Array.isArray(entry.roll)) {
      return roll >= entry.roll[0] && roll <= entry.roll[1];
    }
    if (entry.min !== undefined && entry.max !== undefined) {
      return roll >= entry.min && roll <= entry.max;
    }
    return false;
  });
  
  if (result) {
    showTableResult(currentTableType, roll, result);
    manualRollInput.value = '';
  }
}

// ============================================
// OPEN PANEL BUTTON
// ============================================

function initOpenPanel() {
  const openPanelBtn = document.getElementById('openPanelBtn');
  
  openPanelBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
      if (response?.success) {
        window.close(); // Close popup after opening panel
      }
    });
  });
}

// ============================================
// QUICK NPC GENERATOR
// ============================================

function initQuickNPC() {
  const generateBtn = document.getElementById('quickNPCBtn');
  const overlay = document.getElementById('npcResultOverlay');
  const closeBtn = document.getElementById('closeNPCResult');
  const rerollBtn = document.getElementById('rerollNPCBtn');
  const copyBtn = document.getElementById('copyQuickNPCBtn');
  
  generateBtn.addEventListener('click', () => {
    generateQuickNPC();
  });
  
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
  
  rerollBtn.addEventListener('click', () => {
    generateQuickNPC();
  });
  
  copyBtn.addEventListener('click', () => {
    copyQuickNPC();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
    }
  });
}

async function generateQuickNPC() {
  const overlay = document.getElementById('npcResultOverlay');
  const quirksData = allData?.npc_quirks;
  
  quickNPC = await window.NPCGenerator.generateNPC({ detail: 'standard' }, quirksData);
  displayQuickNPC(quickNPC);
  overlay.classList.add('active');
}

function displayQuickNPC(npc) {
  document.getElementById('quickNPCName').textContent = npc.name.full;
  document.getElementById('quickNPCSubtitle').textContent = 
    `${npc.age.label} ${npc.gender} ${npc.race}, ${npc.occupation.occupation}`;
  
  const body = document.getElementById('quickNPCBody');
  body.innerHTML = `
    <p><strong>Appearance:</strong> ${escapeHtml(npc.appearance.summary)}</p>
    <p><strong>Voice:</strong> ${escapeHtml(npc.voice.summary)}</p>
    <p><strong>Personality:</strong> ${escapeHtml(npc.personality.summary)}</p>
    <p><strong>Mood:</strong> ${escapeHtml(npc.mood.mood)} — ${escapeHtml(npc.mood.description)}</p>
    ${npc.quirk ? `<p><strong>Quirk:</strong> ${escapeHtml(npc.quirk)}</p>` : ''}
  `;
}

function copyQuickNPC() {
  if (!quickNPC) return;
  
  const text = window.NPCGenerator.formatNPCAsText(quickNPC);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyQuickNPCBtn');
    const original = btn.innerHTML;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Copied!
    `;
    setTimeout(() => btn.innerHTML = original, 1500);
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}