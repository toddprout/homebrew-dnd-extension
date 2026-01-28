/**
 * Homebrew DND Quick Reference - Shared Utilities
 * Dice rolling, search, data loading, and storage helpers
 */

// ============================================
// DATA LOADING
// ============================================

/**
 * Cache for loaded data files
 */
const dataCache = new Map();

/**
 * Load a JSON data file from the extension's data folder
 * @param {string} filename - Name of the JSON file (e.g., 'weapons.json')
 * @returns {Promise<any>} Parsed JSON data
 */
async function loadData(filename) {
  // Check cache first
  if (dataCache.has(filename)) {
    return dataCache.get(filename);
  }
  
  try {
    const url = chrome.runtime.getURL(`data/${filename}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status}`);
    }
    
    const data = await response.json();
    dataCache.set(filename, data);
    return data;
  } catch (error) {
    console.error(`Error loading data file ${filename}:`, error);
    return null;
  }
}

/**
 * Load all data files and return combined dataset
 * @returns {Promise<object>} Combined data object
 */
async function loadAllData() {
  const files = [
    'weapons.json',
    'armor.json',
    'adventuring-gear.json',
    'tools.json',
    'mounts-vehicles.json',
    'magic-items.json',
    'potions.json',
    'trinkets.json',
    'wild-magic.json',
    'tavern-drinks.json',
    'npc-quirks.json',
    'loot.json',
    'tavern-events.json',
    'weather.json',
    'dungeon-dressing.json',
    'corpse-pockets.json'
  ];
  
  const results = await Promise.all(
    files.map(async (file) => {
      const data = await loadData(file);
      const key = file.replace('.json', '').replace(/-/g, '_');
      return [key, data];
    })
  );
  
  return Object.fromEntries(results.filter(([_, data]) => data !== null));
}

// ============================================
// DICE ROLLING
// ============================================

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Roll result (1 to sides)
 */
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return results
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides per die
 * @returns {object} { rolls: number[], total: number }
 */
function rollDice(count, sides) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return {
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0)
  };
}

/**
 * Parse dice notation (e.g., "2d6", "1d20+5", "3d8-2")
 * @param {string} notation - Dice notation string
 * @returns {object} { count, sides, modifier }
 */
function parseDiceNotation(notation) {
  const match = notation.toLowerCase().match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  
  if (!match) {
    return null;
  }
  
  return {
    count: parseInt(match[1]) || 1,
    sides: parseInt(match[2]),
    modifier: parseInt(match[3]) || 0
  };
}

/**
 * Roll from dice notation string
 * @param {string} notation - Dice notation (e.g., "2d6+3")
 * @returns {object|null} { rolls, total, notation } or null if invalid
 */
function rollFromNotation(notation) {
  const parsed = parseDiceNotation(notation);
  
  if (!parsed) {
    return null;
  }
  
  const { count, sides, modifier } = parsed;
  const result = rollDice(count, sides);
  
  if (!result) {
    return null;
  }
  
  return {
    ...result,
    modifier,
    total: result.total + modifier,
    notation
  };
}

/**
 * Roll on a d100 table and return the result
 * @param {Array} table - Array of table entries with various format options
 * @returns {object} { roll, result }
 */
function rollOnTable(table) {
  const roll = rollDie(100);
  
  const result = table.find(entry => {
    // Handle single value entries (e.g., { roll: 50, result: "..." })
    if (typeof entry.roll === 'number') {
      return entry.roll === roll;
    }
    // Handle array range entries (e.g., { roll: [1, 2], result: "..." })
    if (Array.isArray(entry.roll)) {
      return roll >= entry.roll[0] && roll <= entry.roll[1];
    }
    // Handle min/max range entries (e.g., { min: 1, max: 5, result: "..." })
    if (entry.min !== undefined && entry.max !== undefined) {
      return roll >= entry.min && roll <= entry.max;
    }
    return false;
  });
  
  return {
    roll,
    result: result || { result: 'No result found for this roll.' }
  };
}

// ============================================
// SEARCH
// ============================================

/**
 * Search through items by name and other fields
 * @param {Array} items - Array of items to search
 * @param {string} query - Search query
 * @param {Array<string>} fields - Fields to search in (default: ['name'])
 * @returns {Array} Matching items
 */
function searchItems(items, query, fields = ['name']) {
  if (!query || !items) return items || [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length === 0) return items;
  
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(normalizedQuery);
      }
      return false;
    });
  });
}

/**
 * Search across all data categories
 * @param {object} allData - Combined data object from loadAllData()
 * @param {string} query - Search query
 * @returns {Array} Array of { category, item } objects
 */
function searchAllData(allData, query) {
  if (!query || query.trim().length === 0) return [];
  
  const results = [];
  const searchFields = ['name', 'description', 'type'];
  
  for (const [category, data] of Object.entries(allData)) {
    if (!data || !data.items) continue;
    
    const matches = searchItems(data.items, query, searchFields);
    
    matches.forEach(item => {
      results.push({
        category,
        categoryName: data.name || formatCategoryName(category),
        item
      });
    });
  }
  
  // Sort by relevance (exact name match first, then starts with, then contains)
  const normalizedQuery = query.toLowerCase().trim();
  
  results.sort((a, b) => {
    const aName = a.item.name.toLowerCase();
    const bName = b.item.name.toLowerCase();
    
    // Exact match first
    if (aName === normalizedQuery && bName !== normalizedQuery) return -1;
    if (bName === normalizedQuery && aName !== normalizedQuery) return 1;
    
    // Starts with query next
    const aStarts = aName.startsWith(normalizedQuery);
    const bStarts = bName.startsWith(normalizedQuery);
    if (aStarts && !bStarts) return -1;
    if (bStarts && !aStarts) return 1;
    
    // Alphabetical
    return aName.localeCompare(bName);
  });
  
  return results;
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Get data from chrome.storage.local
 * @param {string|Array<string>} keys - Key(s) to retrieve
 * @returns {Promise<object>} Stored data
 */
async function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

/**
 * Set data in chrome.storage.local
 * @param {object} data - Data to store
 * @returns {Promise<void>}
 */
async function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

/**
 * Add item to favorites
 * @param {object} item - Item to favorite
 * @param {string} category - Item's category
 */
async function addFavorite(item, category) {
  const { favorites = [] } = await getStorage('favorites');
  
  // Check if already favorited
  const exists = favorites.some(
    fav => fav.item.name === item.name && fav.category === category
  );
  
  if (!exists) {
    favorites.unshift({ item, category, addedAt: Date.now() });
    // Keep max 50 favorites
    if (favorites.length > 50) favorites.pop();
    await setStorage({ favorites });
  }
}

/**
 * Remove item from favorites
 * @param {string} itemName - Name of item to remove
 * @param {string} category - Item's category
 */
async function removeFavorite(itemName, category) {
  const { favorites = [] } = await getStorage('favorites');
  
  const updated = favorites.filter(
    fav => !(fav.item.name === itemName && fav.category === category)
  );
  
  await setStorage({ favorites: updated });
}

/**
 * Check if item is favorited
 * @param {string} itemName - Name of item
 * @param {string} category - Item's category
 * @returns {Promise<boolean>}
 */
async function isFavorite(itemName, category) {
  const { favorites = [] } = await getStorage('favorites');
  return favorites.some(
    fav => fav.item.name === itemName && fav.category === category
  );
}

/**
 * Add search query to recent searches
 * @param {string} query - Search query
 */
async function addRecentSearch(query) {
  if (!query || query.trim().length === 0) return;
  
  const { recentSearches = [] } = await getStorage('recentSearches');
  
  // Remove if exists (to move to front)
  const filtered = recentSearches.filter(q => q !== query);
  filtered.unshift(query);
  
  // Keep max 10 recent searches
  if (filtered.length > 10) filtered.pop();
  
  await setStorage({ recentSearches: filtered });
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format a category key to display name
 * @param {string} category - Category key (e.g., 'adventuring_gear')
 * @returns {string} Formatted name (e.g., 'Adventuring Gear')
 */
function formatCategoryName(category) {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format currency value
 * @param {number|string} value - Value to format
 * @param {string} unit - Currency unit (cp, sp, ep, gp, pp)
 * @returns {string} Formatted string (e.g., "50 gp")
 */
function formatCurrency(value, unit = 'gp') {
  return `${value} ${unit}`;
}

/**
 * Format weight value
 * @param {number} value - Weight in pounds
 * @returns {string} Formatted string (e.g., "5 lb.")
 */
function formatWeight(value) {
  if (value === 0 || value === '—') return '—';
  return `${value} lb.`;
}

/**
 * Get icon for category
 * @param {string} category - Category key
 * @returns {string} SVG icon HTML
 */
function getCategoryIcon(category) {
  const icons = {
    weapons: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6.92 5H5l8.5 8.5L12 15l-1 1-3.5-3.5-4 4L5 18l4-4 3.5 3.5 1-1 1.5-1.5L6.92 5zM19 3l2 2-2.5 2.5-2-2L19 3z"/></svg>',
    armor: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',
    adventuring_gear: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    mounts_vehicles: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
    trinkets: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/></svg>',
    wild_magic: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/></svg>',
    tavern_drinks: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 14c0 1.3.84 2.4 2 2.82V20H3v2h6v-2H7v-3.18C8.16 16.4 9 15.3 9 14V6H3v8zm2-6h2v3H5V8zm15.64 1L19 7h-4l-1.64 2H9v2h3.36l2 6H19v2h2v-4h-2v-2h-2l-1-3h1.64z"/></svg>'
  };
  
  return icons[category] || icons.adventuring_gear;
}

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// EXPORTS (for use in popup and sidepanel)
// ============================================

// Make functions available globally since we're not using modules
window.HomebrewDND = {
  // Data
  loadData,
  loadAllData,
  
  // Dice
  rollDie,
  rollDice,
  parseDiceNotation,
  rollFromNotation,
  rollOnTable,
  
  // Search
  searchItems,
  searchAllData,
  
  // Storage
  getStorage,
  setStorage,
  addFavorite,
  removeFavorite,
  isFavorite,
  addRecentSearch,
  
  // Formatting
  formatCategoryName,
  formatCurrency,
  formatWeight,
  getCategoryIcon,
  
  // Utilities
  debounce
};