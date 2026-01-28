# How to Add New Tables & Data

This guide walks you through adding new d100 tables or item data to the Homebrew DND extension.

---

## Adding a New d100 Table

### Step 1: Create the JSON file

Create a new file in the `/data/` folder. Name it with kebab-case (e.g., `my-new-table.json`).

**Template for d100 tables:**

```json
{
  "name": "My Table Name",
  "description": "A brief description of what this table is for.",
  "source": "Homebrew DND",
  "die": "d100",
  "homebrew": true,
  "entries": [
    { "min": 1, "max": 2, "result": "First result (covers rolls 1-2)" },
    { "min": 3, "max": 4, "result": "Second result (covers rolls 3-4)" },
    { "min": 5, "max": 5, "result": "Single roll result (only roll 5)" },
    ...
    { "min": 99, "max": 99, "result": "Roll 99 result" },
    { "min": 100, "max": 100, "result": "Roll 100 result - make it special!" }
  ]
}
```

**Tips:**
- `min` and `max` define the roll range (use same number for single rolls)
- Make sure ranges cover 1-100 with no gaps or overlaps
- Roll 100 is traditionally special ("Roll twice", rare outcome, etc.)
- For items with names (like drinks), use: `{ "min": 1, "max": 2, "name": "Item Name", "effect": "Description" }`

---

### Step 2: Register the file in utils.js

Open `/shared/utils.js` and find the `loadAllData()` function. Add your filename to the array:

```javascript
async function loadAllData() {
  const files = [
    'weapons.json',
    'armor.json',
    // ... existing files ...
    'corpse-pockets.json',
    'my-new-table.json'  // <-- Add your file here
  ];
```

**Note:** The filename `my-new-table.json` becomes `my_new_table` internally (hyphens → underscores).

---

### Step 3: Add to the Popup

#### 3a. Add the button in popup.html

Find the `<section class="quick-links">` and add a new button:

```html
<button class="quick-link-btn" data-table="my_new_table">
  <span class="quick-link-icon">🆕</span>
  <span>My Table</span>
</button>
```

**Note:** Use underscores in `data-table` to match the internal key.

#### 3b. Add the display name in popup.js

Find the `tableNames` object in the `showTableResult()` function and add your table:

```javascript
const tableNames = {
  trinkets: 'Trinket',
  wild_magic: 'Wild Magic Surge',
  // ... existing tables ...
  my_new_table: 'My Table Name'  // <-- Add this
};
```

---

### Step 4: Add to the Side Panel

#### 4a. Add the card in sidepanel.html

Find the `<div class="tables-grid">` section and add a new card:

```html
<div class="table-card homebrew" data-table="my_new_table">
  <div class="table-icon">🆕</div>
  <div class="table-info">
    <h3>My Table Name</h3>
    <p>Brief description of the table</p>
    <span class="homebrew-badge">Homebrew</span>
  </div>
  <button class="btn btn-primary roll-table-btn">Roll d100</button>
</div>
```

**Note:** Remove `homebrew` class and badge if it's official SRD content.

#### 4b. Add the display name in sidepanel.js

Find the `tableNames` object in the `showTableResult()` function and add your table:

```javascript
const tableNames = {
  trinkets: 'Trinket',
  wild_magic: 'Wild Magic Surge',
  // ... existing tables ...
  my_new_table: 'My Table Name'  // <-- Add this
};
```

---

### Step 5: Test it!

1. Go to `chrome://extensions/`
2. Find "Homebrew DnD" and click the refresh icon ↻
3. Open the popup and test your new table button
4. Open the side panel and test it there too

---

## Adding New Item Data (Equipment, Magic Items, etc.)

### Step 1: Create or edit the JSON file

**Template for item lists:**

```json
{
  "name": "Category Name",
  "description": "What these items are",
  "items": [
    {
      "name": "Item Name",
      "cost": "10 gp",
      "weight": "2 lb.",
      "description": "What the item does"
    },
    {
      "name": "Magic Item",
      "type": "Wondrous item",
      "rarity": "Uncommon",
      "attunement": true,
      "description": "Magic item description"
    }
  ]
}
```

**Common fields:**
- `name` - Required
- `cost` / `price` - Item cost
- `weight` - Item weight
- `description` - What it does
- `type` - Item type (for magic items)
- `rarity` - Common, Uncommon, Rare, Very Rare, Legendary
- `attunement` - true/false
- `damage` - For weapons
- `ac` - For armor

---

### Step 2: Register in utils.js

Same as tables - add the filename to the `loadAllData()` array.

---

### Step 3: Add to Browse section (Side Panel only)

#### 3a. Add category card in sidepanel.html

Find the category grid and add:

```html
<button class="category-card" data-category="my_items">
  <div class="category-icon">
    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
      <!-- SVG path here -->
    </svg>
  </div>
  <span class="category-name">My Items</span>
  <span class="category-count" id="count-my_items">0</span>
</button>
```

#### 3b. Update category counts in sidepanel.js

Find `updateCategoryCounts()` and add your category:

```javascript
const categories = ['weapons', 'armor', /* ... */, 'my_items'];
```

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Data files | `/data/` |
| Data loader | `/shared/utils.js` → `loadAllData()` |
| Popup buttons | `/popup/popup.html` → `<section class="quick-links">` |
| Popup table names | `/popup/popup.js` → `showTableResult()` → `tableNames` |
| Side panel table cards | `/sidepanel/sidepanel.html` → `<div class="tables-grid">` |
| Side panel table names | `/sidepanel/sidepanel.js` → `showTableResult()` → `tableNames` |
| Side panel browse cards | `/sidepanel/sidepanel.html` → category grid |
| Side panel category counts | `/sidepanel/sidepanel.js` → `updateCategoryCounts()` |

---

## Emoji Suggestions for Tables

| Type | Emoji |
|------|-------|
| Trinkets/Items | 🎲 📦 🎁 |
| Magic | ✨ 🔮 ⚡ |
| Combat | ⚔️ 🗡️ 💥 |
| Food/Drink | 🍺 🍻 🍖 |
| NPCs | 🎭 👤 🧙 |
| Treasure | 💰 💎 👑 |
| Weather | 🌦️ ⛈️ ☀️ |
| Dungeon | 🏰 🚪 🕯️ |
| Death/Dark | 💀 ☠️ 🦴 |
| Nature | 🌲 🌿 🐺 |
| Travel | 🗺️ 🧭 🛤️ |

---

## Troubleshooting

**Table not showing up?**
- Check filename matches in utils.js (use exact filename)
- Check data-table attribute uses underscores, not hyphens
- Check for JSON syntax errors (missing commas, brackets)

**Rolls not working?**
- Ensure min/max ranges cover 1-100 with no gaps
- Check that entries use `min`/`max` OR `roll` (for single values)

**Items not displaying correctly?**
- Check the field names match what sidepanel.js expects
- Common fields: `name`, `cost`, `description`, `rarity`, `attunement`

**After making changes:**
Always refresh the extension at `chrome://extensions/` before testing!
