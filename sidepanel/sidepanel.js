/**
 * Homebrew DND Quick Reference - Side Panel Script
 * Full reference interface with browse, tables, dice, and favorites
 */

// ============================================
// STATE
// ============================================

let allData = null;
let currentCategory = null;
let currentItem = null;
let currentTableType = null;
let rollHistory = [];
let currentNPC = null;
let lockedFields = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load all data
    allData = await window.HomebrewDND.loadAllData();
    
    // Initialize all components
    initTabs();
    initSearch();
    initBrowse();
    initTables();
    initDice();
    initFavorites();
    initItemDetail();
    initNPCGenerator();
    
    // Update category counts
    updateCategoryCounts();
    
    // Listen for context menu search
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'searchFromContext') {
        document.getElementById('searchInput').value = message.query;
        performSearch(message.query);
      }
    });
  } catch (error) {
    console.error('Failed to initialize side panel:', error);
  }
});

// ============================================
// TABS
// ============================================

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const sections = {
    browse: document.getElementById('browseSection'),
    tables: document.getElementById('tablesSection'),
    npc: document.getElementById('npcSection'),
    dice: document.getElementById('diceSection'),
    favorites: document.getElementById('favoritesSection')
  };
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Hide search results when switching tabs
      const searchResults = document.getElementById('searchResultsSection');
      const searchInput = document.getElementById('searchInput');
      const searchClear = document.getElementById('searchClear');
      
      if (searchResults) searchResults.classList.remove('active');
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.classList.remove('visible');
      
      // Show selected section
      Object.entries(sections).forEach(([name, section]) => {
        if (section) {
          section.classList.toggle('hidden', name !== tabName);
        }
      });
      
      // Refresh favorites when switching to that tab
      if (tabName === 'favorites') {
        loadFavorites();
      }
    });
  });
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResultsSection = document.getElementById('searchResultsSection');
  
  // Debounced search
  const debouncedSearch = window.HomebrewDND.debounce((query) => {
    performSearch(query);
  }, 200);
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Toggle clear button visibility
    searchClear.classList.toggle('visible', query.length > 0);
    
    if (query.length === 0) {
      searchResultsSection.classList.remove('active');
      return;
    }
    
    if (query.length >= 2) {
      debouncedSearch(query);
    }
  });
  
  // Clear button
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    searchResultsSection.classList.remove('active');
    searchInput.focus();
  });
  
  // Keyboard shortcuts
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchClear.classList.remove('visible');
      searchResultsSection.classList.remove('active');
      searchInput.blur();
    }
  });
}

function performSearch(query) {
  const searchResultsSection = document.getElementById('searchResultsSection');
  const searchResultsList = document.getElementById('searchResultsList');
  const resultCount = document.getElementById('resultCount');
  
  if (!searchResultsSection || !searchResultsList) return;
  
  if (!allData) {
    searchResultsList.innerHTML = '<div class="empty-state">Loading data...</div>';
    searchResultsSection.classList.add('active');
    return;
  }
  
  const results = window.HomebrewDND.searchAllData(allData, query);
  
  if (resultCount) {
    resultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
  }
  
  if (results.length === 0) {
    searchResultsList.innerHTML = `
      <div class="empty-state">
        <p>No items found for "${escapeHtml(query)}"</p>
      </div>
    `;
    searchResultsSection.classList.add('active');
    return;
  }
  
  searchResultsList.innerHTML = results.map(({ category, categoryName, item }) => {
    const price = item.cost || item.price || '';
    return `
      <div class="search-result-row" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}' data-category="${category}">
        <div class="search-result-info">
          <div class="search-result-name">${escapeHtml(item.name)}</div>
          <div class="search-result-meta">
            <span class="search-result-category">${escapeHtml(categoryName)}</span>
          </div>
        </div>
        ${price ? `<span class="search-result-price">${escapeHtml(price)}</span>` : ''}
      </div>
    `;
  }).join('');
  
  // Add click handlers
  searchResultsList.querySelectorAll('.search-result-row').forEach(row => {
    row.addEventListener('click', () => {
      const item = JSON.parse(row.dataset.item);
      const category = row.dataset.category;
      showItemDetail(item, category);
      
      // Save to recent searches
      window.HomebrewDND.addRecentSearch(query);
    });
  });
  
  searchResultsSection.classList.add('active');
}

// ============================================
// BROWSE TAB
// ============================================

function initBrowse() {
  const categoryCards = document.querySelectorAll('.category-card');
  const categoryItemsSection = document.getElementById('categoryItemsSection');
  const backBtn = document.getElementById('backToCategories');
  
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      showCategoryItems(category);
    });
  });
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      categoryItemsSection.classList.remove('active');
      document.querySelector('.category-grid').style.display = 'grid';
      currentCategory = null;
    });
  }
}

function updateCategoryCounts() {
  if (!allData) return;
  
  const categories = ['weapons', 'armor', 'adventuring_gear', 'tools', 'mounts_vehicles', 'magic_items', 'potions', 'tavern_drinks'];
  
  categories.forEach(category => {
    const countEl = document.getElementById(`count-${category}`);
    if (countEl && allData[category]) {
      const items = allData[category].items || allData[category].entries || [];
      countEl.textContent = items.length;
    }
  });
}

function showCategoryItems(category) {
  currentCategory = category;
  
  const categoryGrid = document.querySelector('.category-grid');
  const categoryItemsSection = document.getElementById('categoryItemsSection');
  const categoryTitle = document.getElementById('categoryTitle');
  const itemsList = document.getElementById('itemsList');
  
  const categoryData = allData[category];
  if (!categoryData) return;
  
  const items = categoryData.items || categoryData.entries || [];
  
  categoryTitle.textContent = categoryData.name || window.HomebrewDND.formatCategoryName(category);
  
  // Render items
  itemsList.innerHTML = items.map((item, index) => {
    const price = item.cost || item.price || '';
    const type = item.type || '';
    const name = item.name || item.result || `Entry ${index + 1}`;
    
    return `
      <div class="item-row" data-index="${index}" data-category="${category}">
        <div class="item-info">
          <div class="item-name">${escapeHtml(name)}</div>
          ${type ? `<div class="item-type">${escapeHtml(type)}</div>` : ''}
        </div>
        ${price ? `<span class="item-price">${escapeHtml(price)}</span>` : ''}
      </div>
    `;
  }).join('');
  
  // Add click handlers
  itemsList.querySelectorAll('.item-row').forEach(row => {
    row.addEventListener('click', () => {
      const index = parseInt(row.dataset.index);
      const item = items[index];
      showItemDetail(item, category);
    });
  });
  
  // Show items section, hide grid
  categoryGrid.style.display = 'none';
  categoryItemsSection.classList.add('active');
}

// ============================================
// TABLES TAB
// ============================================

function initTables() {
  const tableCards = document.querySelectorAll('.table-card');
  const rerollBtn = document.getElementById('rerollTableBtn');
  const copyBtn = document.getElementById('copyResultBtn');
  
  tableCards.forEach(card => {
    const rollBtn = card.querySelector('.roll-table-btn');
    const tableType = card.dataset.table;
    
    rollBtn.addEventListener('click', () => {
      rollOnTable(tableType);
    });
  });
  
  rerollBtn.addEventListener('click', () => {
    if (currentTableType) {
      rollOnTable(currentTableType);
    }
  });
  
  copyBtn.addEventListener('click', () => {
    copyTableResult();
  });
}

function rollOnTable(tableType) {
  currentTableType = tableType;
  
  const tableData = allData[tableType];
  if (!tableData) return;
  
  const entries = tableData.items || tableData.entries || [];
  const { roll, result } = window.HomebrewDND.rollOnTable(entries);
  
  showTableResult(tableType, roll, result);
}

function showTableResult(tableType, roll, result) {
  const display = document.getElementById('tableResultDisplay');
  const nameEl = document.getElementById('tableResultName');
  const rollEl = document.getElementById('tableRollNumber');
  const contentEl = document.getElementById('tableResultContent');
  
  // Table display names
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
  
  nameEl.textContent = tableNames[tableType] || window.HomebrewDND.formatCategoryName(tableType);
  rollEl.textContent = roll.toString().padStart(2, '0');
  
  // Build content based on result type
  let contentHtml = '';
  
  if (result.name) {
    contentHtml += `<div class="result-name">${escapeHtml(result.name)}</div>`;
  }
  
  if (result.price) {
    contentHtml += `<div class="result-price">${escapeHtml(result.price)}</div>`;
  }
  
  if (result.effect) {
    contentHtml += `<div class="result-effect">${escapeHtml(result.effect)}</div>`;
  } else if (result.result) {
    contentHtml += `<div class="result-effect">${escapeHtml(result.result)}</div>`;
  } else if (result.description) {
    contentHtml += `<div class="result-effect">${escapeHtml(result.description)}</div>`;
  }
  
  contentEl.innerHTML = contentHtml;
  
  // Show with animation
  display.classList.remove('active');
  setTimeout(() => {
    display.classList.add('active');
    // Scroll to the result
    display.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 10);
}

function copyTableResult() {
  const nameEl = document.getElementById('tableResultName');
  const rollEl = document.getElementById('tableRollNumber');
  const contentEl = document.getElementById('tableResultContent');
  
  const text = `${nameEl.textContent} (Roll: ${rollEl.textContent})\n${contentEl.textContent}`;
  
  navigator.clipboard.writeText(text).then(() => {
    // Show feedback
    const copyBtn = document.getElementById('copyResultBtn');
    const originalHtml = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Copied!
    `;
    setTimeout(() => {
      copyBtn.innerHTML = originalHtml;
    }, 2000);
  });
}

// ============================================
// DICE TAB
// ============================================

function initDice() {
  const diceButtons = document.querySelectorAll('.dice-btn-large');
  const customInput = document.getElementById('customRollInput');
  const customBtn = document.getElementById('customRollBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  
  // Standard dice buttons
  diceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sides = parseInt(btn.dataset.sides);
      rollDice(1, sides);
    });
  });
  
  // Custom roll
  customBtn.addEventListener('click', () => {
    const notation = customInput.value.trim();
    if (notation) {
      rollCustomDice(notation);
    }
  });
  
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const notation = customInput.value.trim();
      if (notation) {
        rollCustomDice(notation);
      }
    }
  });
  
  // Clear history
  clearHistoryBtn.addEventListener('click', () => {
    rollHistory = [];
    updateRollHistory();
  });
}

function rollDice(count, sides) {
  const resultEl = document.getElementById('diceResultLarge');
  const notationEl = document.getElementById('diceNotation');
  
  // Animation
  resultEl.classList.add('rolling');
  
  let animCount = 0;
  const animInterval = setInterval(() => {
    resultEl.textContent = Math.floor(Math.random() * sides) + 1;
    animCount++;
    if (animCount > 6) {
      clearInterval(animInterval);
      
      // Final roll
      const result = window.HomebrewDND.rollDice(count, sides);
      resultEl.textContent = result.total;
      resultEl.classList.remove('rolling');
      
      const notation = count > 1 ? `${count}d${sides}` : `d${sides}`;
      notationEl.textContent = count > 1 ? `${notation} = ${result.rolls.join(' + ')}` : notation;
      
      // Add to history
      addToRollHistory(notation, result.total, result.rolls);
    }
  }, 50);
}

function rollCustomDice(notation) {
  const resultEl = document.getElementById('diceResultLarge');
  const notationEl = document.getElementById('diceNotation');
  
  const result = window.HomebrewDND.rollFromNotation(notation);
  
  if (!result) {
    notationEl.textContent = 'Invalid notation. Try: 2d6+3';
    return;
  }
  
  // Animation
  resultEl.classList.add('rolling');
  
  let animCount = 0;
  const animInterval = setInterval(() => {
    resultEl.textContent = Math.floor(Math.random() * 20) + 1;
    animCount++;
    if (animCount > 6) {
      clearInterval(animInterval);
      
      resultEl.textContent = result.total;
      resultEl.classList.remove('rolling');
      
      let notationText = notation;
      if (result.rolls.length > 1) {
        notationText += ` = ${result.rolls.join(' + ')}`;
        if (result.modifier !== 0) {
          notationText += ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`;
        }
      }
      notationEl.textContent = notationText;
      
      // Add to history
      addToRollHistory(notation, result.total, result.rolls);
    }
  }, 50);
}

function addToRollHistory(notation, total, rolls) {
  rollHistory.unshift({
    notation,
    total,
    rolls,
    timestamp: Date.now()
  });
  
  // Keep max 20 items
  if (rollHistory.length > 20) {
    rollHistory.pop();
  }
  
  updateRollHistory();
}

function updateRollHistory() {
  const historyList = document.getElementById('rollHistoryList');
  
  if (rollHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-state">No rolls yet</div>';
    return;
  }
  
  historyList.innerHTML = rollHistory.map(entry => `
    <div class="roll-history-item">
      <span class="roll-history-notation">${escapeHtml(entry.notation)}</span>
      <span class="roll-history-result">${entry.total}</span>
    </div>
  `).join('');
}

// ============================================
// FAVORITES TAB
// ============================================

function initFavorites() {
  loadFavorites();
}

async function loadFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  const { favorites = [] } = await window.HomebrewDND.getStorage('favorites');
  
  if (favorites.length === 0) {
    favoritesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⭐</div>
        <p>No favorites yet</p>
        <p class="text-muted">Click the star on any item to save it here</p>
      </div>
    `;
    return;
  }
  
  favoritesList.innerHTML = favorites.map((fav, index) => {
    // Handle NPC type
    if (fav.type === 'npc') {
      return `
        <div class="favorite-row favorite-npc" data-index="${index}" data-type="npc">
          <div class="favorite-info">
            <div class="favorite-name">🎭 ${escapeHtml(fav.name)}</div>
            <div class="favorite-category">Saved NPC</div>
          </div>
          <button class="btn-icon remove-favorite-btn" data-index="${index}" title="Remove from favorites">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      `;
    }
    
    // Handle regular items
    const { item, category } = fav;
    return `
      <div class="favorite-row" data-index="${index}" data-category="${category}">
        <div class="favorite-info">
          <div class="favorite-name">${escapeHtml(item.name)}</div>
          <div class="favorite-category">${window.HomebrewDND.formatCategoryName(category)}</div>
        </div>
        <button class="btn-icon remove-favorite-btn" data-index="${index}" title="Remove from favorites">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
  
  // Click to view detail
  favoritesList.querySelectorAll('.favorite-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.remove-favorite-btn')) return;
      
      const index = parseInt(row.dataset.index);
      const fav = favorites[index];
      
      if (fav.type === 'npc') {
        showSavedNPCDetail(fav.data);
      } else {
        showItemDetail(fav.item, fav.category);
      }
    });
  });
  
  // Remove buttons
  favoritesList.querySelectorAll('.remove-favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      
      // Remove by index
      const result = await chrome.storage.local.get(['favorites']);
      const favs = result.favorites || [];
      favs.splice(index, 1);
      await chrome.storage.local.set({ favorites: favs });
      loadFavorites();
    });
  });
}

function showSavedNPCDetail(npc) {
  const overlay = document.getElementById('itemDetailOverlay');
  const nameEl = document.getElementById('itemDetailName');
  const typeEl = document.getElementById('itemDetailType');
  const bodyEl = document.getElementById('itemDetailBody');
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  // Hide favorite button for NPCs (already saved)
  if (favoriteBtn) favoriteBtn.style.display = 'none';
  
  nameEl.textContent = npc.name.full;
  typeEl.textContent = `${npc.age.label} ${npc.gender} ${npc.race}, ${npc.occupation.occupation}`;
  
  let bodyHtml = `
    <div class="item-detail-row">
      <span class="item-detail-label">Appearance</span>
      <span class="item-detail-value">${escapeHtml(npc.appearance.summary)}</span>
    </div>
    <div class="item-detail-row">
      <span class="item-detail-label">Voice</span>
      <span class="item-detail-value">${escapeHtml(npc.voice.summary)}</span>
    </div>
    <div class="item-detail-row">
      <span class="item-detail-label">Personality</span>
      <span class="item-detail-value">${escapeHtml(npc.personality.summary)}</span>
    </div>
    <div class="item-detail-row">
      <span class="item-detail-label">Current Mood</span>
      <span class="item-detail-value">${escapeHtml(npc.mood.mood)} — ${escapeHtml(npc.mood.description)}</span>
    </div>
  `;
  
  if (npc.quirk) {
    bodyHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Quirk</span>
        <span class="item-detail-value">${escapeHtml(npc.quirk)}</span>
      </div>
    `;
  }
  
  if (npc.secret) {
    bodyHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Secret</span>
        <span class="item-detail-value">${escapeHtml(npc.secret.secret)}</span>
      </div>
    `;
  }
  
  if (npc.bond) {
    bodyHtml += `
      <div class="item-detail-row">
        <span class="item-detail-label">Bond</span>
        <span class="item-detail-value">${escapeHtml(npc.bond.bond)}</span>
      </div>
    `;
  }
  
  bodyEl.innerHTML = bodyHtml;
  overlay.classList.add('active');
}

// ============================================
// ITEM DETAIL
// ============================================

function initItemDetail() {
  const overlay = document.getElementById('itemDetailOverlay');
  const closeBtn = document.getElementById('closeDetailBtn');
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    currentItem = null;
    // Show favorite button again
    if (favoriteBtn) favoriteBtn.style.display = '';
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      currentItem = null;
    }
  });
  
  favoriteBtn.addEventListener('click', async () => {
    if (!currentItem) return;
    
    const isFav = await window.HomebrewDND.isFavorite(currentItem.item.name, currentItem.category);
    
    if (isFav) {
      await window.HomebrewDND.removeFavorite(currentItem.item.name, currentItem.category);
      favoriteBtn.classList.remove('favorited');
    } else {
      await window.HomebrewDND.addFavorite(currentItem.item, currentItem.category);
      favoriteBtn.classList.add('favorited');
    }
  });
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      currentItem = null;
    }
  });
}

async function showItemDetail(item, category) {
  currentItem = { item, category };
  
  const overlay = document.getElementById('itemDetailOverlay');
  const nameEl = document.getElementById('itemDetailName');
  const typeEl = document.getElementById('itemDetailType');
  const bodyEl = document.getElementById('itemDetailBody');
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  // Set name and type
  nameEl.textContent = item.name || 'Item';
  typeEl.textContent = item.type || window.HomebrewDND.formatCategoryName(category);
  
  // Check if favorited
  const isFav = await window.HomebrewDND.isFavorite(item.name, category);
  favoriteBtn.classList.toggle('favorited', isFav);
  
  // Build detail body
  let bodyHtml = '';
  
  // Price
  if (item.cost || item.price) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Cost</span>
        <span class="detail-value price">${escapeHtml(item.cost || item.price)}</span>
      </div>
    `;
  }
  
  // Rarity (magic items, potions)
  if (item.rarity) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Rarity</span>
        <span class="detail-value">${escapeHtml(item.rarity)}</span>
      </div>
    `;
  }
  
  // Attunement (magic items)
  if (item.attunement !== undefined) {
    let attunementText = item.attunement ? 'Yes' : 'No';
    if (item.attunement_requirement) {
      attunementText = item.attunement_requirement;
    }
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Attunement</span>
        <span class="detail-value">${escapeHtml(attunementText)}</span>
      </div>
    `;
  }
  
  // Cursed (magic items)
  if (item.cursed) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Cursed</span>
        <span class="detail-value" style="color: var(--color-magic);">Yes</span>
      </div>
    `;
  }
  
  // Weight
  if (item.weight !== undefined && item.weight !== null) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Weight</span>
        <span class="detail-value">${window.HomebrewDND.formatWeight(item.weight)}</span>
      </div>
    `;
  }
  
  // Damage (weapons)
  if (item.damage) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Damage</span>
        <span class="detail-value">${escapeHtml(item.damage)}${item.damage_type ? ` ${item.damage_type}` : ''}</span>
      </div>
    `;
  }
  
  // Armor Class
  if (item.armor_class || item.ac) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Armor Class</span>
        <span class="detail-value">${escapeHtml(item.armor_class || item.ac)}</span>
      </div>
    `;
  }
  
  // Strength requirement
  if (item.strength) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Strength Required</span>
        <span class="detail-value">${escapeHtml(item.strength)}</span>
      </div>
    `;
  }
  
  // Stealth
  if (item.stealth) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Stealth</span>
        <span class="detail-value">${escapeHtml(item.stealth)}</span>
      </div>
    `;
  }
  
  // Properties (weapons)
  if (item.properties && item.properties.length > 0) {
    const props = Array.isArray(item.properties) ? item.properties.join(', ') : item.properties;
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Properties</span>
        <span class="detail-value">${escapeHtml(props)}</span>
      </div>
    `;
  }
  
  // Speed (mounts)
  if (item.speed) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Speed</span>
        <span class="detail-value">${escapeHtml(item.speed)}</span>
      </div>
    `;
  }
  
  // Carrying capacity (mounts)
  if (item.carrying_capacity) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Carrying Capacity</span>
        <span class="detail-value">${escapeHtml(item.carrying_capacity)}</span>
      </div>
    `;
  }
  
  // Crew/passengers (vehicles)
  if (item.crew !== undefined) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Crew</span>
        <span class="detail-value">${item.crew}</span>
      </div>
    `;
  }
  
  if (item.passengers !== undefined) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Passengers</span>
        <span class="detail-value">${item.passengers}</span>
      </div>
    `;
  }
  
  if (item.cargo) {
    bodyHtml += `
      <div class="detail-row">
        <span class="detail-label">Cargo</span>
        <span class="detail-value">${escapeHtml(item.cargo)}</span>
      </div>
    `;
  }
  
  // Description
  if (item.description) {
    bodyHtml += `
      <div class="detail-description">
        <h4>Description</h4>
        <p>${escapeHtml(item.description)}</p>
      </div>
    `;
  }
  
  // Effect (tavern drinks, etc.)
  if (item.effect) {
    bodyHtml += `
      <div class="detail-description">
        <h4>Effect</h4>
        <p>${escapeHtml(item.effect)}</p>
      </div>
    `;
  }
  
  // Result (trinkets, wild magic)
  if (item.result && !item.name) {
    bodyHtml += `
      <div class="detail-description">
        <h4>Description</h4>
        <p>${escapeHtml(item.result)}</p>
      </div>
    `;
  }
  
  bodyEl.innerHTML = bodyHtml || '<p class="text-muted">No additional details available.</p>';
  
  // Show overlay
  overlay.classList.add('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// NPC GENERATOR
// ============================================

function initNPCGenerator() {
  const generateBtn = document.getElementById('generateNPCBtn');
  const raceFilter = document.getElementById('npcRaceFilter');
  const detailLevel = document.getElementById('npcDetailLevel');
  
  generateBtn.addEventListener('click', () => {
    generateAndDisplayNPC();
  });
  
  // Also regenerate when filters change (if NPC exists)
  raceFilter.addEventListener('change', () => {
    if (currentNPC) {
      // Clear locked race if filter changes
      delete lockedFields.race;
      generateAndDisplayNPC();
    }
  });
}

async function generateAndDisplayNPC() {
  const raceFilter = document.getElementById('npcRaceFilter').value;
  const detailLevel = document.getElementById('npcDetailLevel').value;
  
  const options = {
    race: raceFilter || null,
    detail: detailLevel,
    locked: lockedFields
  };
  
  // Pass quirks data for integration
  const quirksData = allData?.npc_quirks;
  
  currentNPC = await window.NPCGenerator.generateNPC(options, quirksData);
  displayNPC(currentNPC);
}

function displayNPC(npc) {
  const card = document.getElementById('npcCard');
  const template = document.getElementById('npcCardTemplate');
  const detailLevel = document.getElementById('npcDetailLevel').value;
  
  // Clone template
  const content = template.content.cloneNode(true);
  
  // Fill in header
  content.querySelector('.npc-name').textContent = npc.name.full;
  content.querySelector('.npc-subtitle').textContent = 
    `${npc.age.label} ${npc.gender} ${npc.race}, ${npc.occupation.occupation}`;
  
  // Fill in fields
  const fields = content.querySelectorAll('.npc-field');
  fields.forEach(field => {
    const fieldName = field.dataset.field;
    const valueEl = field.querySelector('.npc-field-value');
    
    // Hide secret/bond if not full detail
    if ((fieldName === 'secret' || fieldName === 'bond') && detailLevel !== 'full') {
      field.style.display = 'none';
      return;
    }
    
    // Hide quirk if quick detail
    if (fieldName === 'quirk' && detailLevel === 'quick') {
      field.style.display = 'none';
      return;
    }
    
    // Set field value
    switch (fieldName) {
      case 'appearance':
        valueEl.textContent = npc.appearance.summary;
        break;
      case 'voice':
        valueEl.textContent = npc.voice.summary;
        break;
      case 'personality':
        valueEl.textContent = npc.personality.summary;
        break;
      case 'mood':
        valueEl.textContent = `${npc.mood.mood} — ${npc.mood.description}`;
        break;
      case 'quirk':
        valueEl.textContent = npc.quirk || 'None';
        break;
      case 'secret':
        valueEl.textContent = npc.secret?.secret || 'None';
        break;
      case 'bond':
        valueEl.textContent = npc.bond?.bond || 'None';
        break;
    }
    
    // Set locked state
    if (lockedFields[fieldName]) {
      field.classList.add('locked');
      field.querySelector('.btn-lock').textContent = '🔒';
    }
    
    // Lock button
    field.querySelector('.btn-lock').addEventListener('click', () => {
      toggleFieldLock(fieldName, field);
    });
    
    // Reroll button
    field.querySelector('.btn-reroll').addEventListener('click', () => {
      rerollField(fieldName, field);
    });
  });
  
  // Copy button
  content.querySelector('#copyNPCBtn').addEventListener('click', () => {
    copyNPCToClipboard();
  });
  
  // Save button
  content.querySelector('#saveNPCBtn').addEventListener('click', () => {
    saveNPCToFavorites();
  });
  
  // Replace card content
  card.innerHTML = '';
  card.appendChild(content);
}

function toggleFieldLock(fieldName, fieldEl) {
  if (lockedFields[fieldName]) {
    delete lockedFields[fieldName];
    fieldEl.classList.remove('locked');
    fieldEl.querySelector('.btn-lock').textContent = '🔓';
  } else {
    lockedFields[fieldName] = currentNPC[fieldName];
    fieldEl.classList.add('locked');
    fieldEl.querySelector('.btn-lock').textContent = '🔒';
  }
}

async function rerollField(fieldName, fieldEl) {
  if (lockedFields[fieldName]) return;
  
  const quirksData = allData?.npc_quirks;
  const newValue = await window.NPCGenerator.regenerateField(currentNPC, fieldName, quirksData);
  
  if (newValue) {
    currentNPC[fieldName] = newValue;
    
    // Update display
    const valueEl = fieldEl.querySelector('.npc-field-value');
    fieldEl.classList.add('rerolling');
    
    switch (fieldName) {
      case 'appearance':
        valueEl.textContent = newValue.summary;
        break;
      case 'voice':
        valueEl.textContent = newValue.summary;
        break;
      case 'personality':
        valueEl.textContent = newValue.summary;
        break;
      case 'mood':
        valueEl.textContent = `${newValue.mood} — ${newValue.description}`;
        break;
      case 'quirk':
        valueEl.textContent = newValue;
        break;
      case 'secret':
        valueEl.textContent = newValue.secret;
        break;
      case 'bond':
        valueEl.textContent = newValue.bond;
        break;
    }
    
    setTimeout(() => fieldEl.classList.remove('rerolling'), 200);
  }
}

function copyNPCToClipboard() {
  if (!currentNPC) return;
  
  const text = window.NPCGenerator.formatNPCAsText(currentNPC);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyNPCBtn');
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

async function saveNPCToFavorites() {
  if (!currentNPC) return;
  
  const npcToSave = {
    type: 'npc',
    name: currentNPC.name.full,
    data: currentNPC,
    savedAt: Date.now()
  };
  
  const result = await chrome.storage.local.get(['favorites']);
  const favorites = result.favorites || [];
  favorites.unshift(npcToSave);
  await chrome.storage.local.set({ favorites });
  
  const btn = document.getElementById('saveNPCBtn');
  const original = btn.innerHTML;
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    Saved!
  `;
  setTimeout(() => btn.innerHTML = original, 1500);
}