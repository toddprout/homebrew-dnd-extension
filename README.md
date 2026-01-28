# Homebrew DND - DM Quick Reference

A Chrome extension for Dungeon Masters to quickly look up equipment prices, roll on d100 tables, and access reference material without leaving their browser.

## Features

- **Quick Search** - Find any item instantly across all categories
- **Equipment Browser** - Weapons, armor, gear, tools, mounts & vehicles
- **d100 Tables** - Trinkets, Wild Magic Surge, and custom Tavern Drinks
- **Dice Roller** - All standard dice plus custom notation (2d6+3)
- **Favorites** - Save frequently-used items for quick access
- **Offline-First** - All data bundled, no internet required
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+D` / `Cmd+Shift+D` - Open quick popup
  - `Ctrl+Shift+H` / `Cmd+Shift+H` - Open full side panel

## Installation

### For Development/Testing:

1. Add your icons to the `/icons/` folder:
   - `icon16.png` (16x16 px)
   - `icon32.png` (32x32 px)
   - `icon48.png` (48x48 px)
   - `icon128.png` (128x128 px)

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `homebrewdnd-extension` folder

6. The extension should now appear in your toolbar!

### For Publishing:

1. Zip the entire `homebrewdnd-extension` folder
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay the one-time $5 developer fee (if you haven't already)
4. Upload your zip file and fill in the listing details

## Project Structure

```
homebrewdnd-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (shortcuts, messages)
├── popup/                  # Quick-access popup
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── sidepanel/              # Full reference panel
│   ├── sidepanel.html
│   ├── sidepanel.css
│   └── sidepanel.js
├── shared/                 # Shared resources
│   ├── styles.css          # Brand styles & components
│   └── utils.js            # Data loading, dice, search
├── data/                   # Reference data (JSON)
│   ├── weapons.json
│   ├── armor.json
│   ├── adventuring-gear.json
│   ├── tools.json
│   ├── mounts-vehicles.json
│   ├── trinkets.json
│   ├── wild-magic.json
│   └── tavern-drinks.json  # Homebrew!
├── icons/                  # Extension icons (add yours!)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Adding More Tables

To add a new d100 table:

1. Create a JSON file in `/data/` following this format:

```json
{
  "name": "Your Table Name",
  "description": "Description of the table",
  "die": "d100",
  "homebrew": true,
  "entries": [
    { "min": 1, "max": 2, "result": "Effect description" },
    { "min": 3, "max": 4, "result": "Another effect" }
  ]
}
```

2. Add the filename to the `files` array in `shared/utils.js` `loadAllData()` function

3. Add a card for it in `sidepanel/sidepanel.html` in the Tables section

4. Add a quick link button in `popup/popup.html` if desired

## Customization

### Colors (in `shared/styles.css`):
- `--bg-primary`: #1a1a1a (main background)
- `--accent`: #8fbfa9 (your sage green)
- `--color-weapon`: #c9a959 (gold for prices)

### Fonts:
- Display: Cinzel (fantasy serif)
- Body: System fonts

## Legal Note

Equipment data is based on the D&D 5th Edition SRD, which is available under the Creative Commons license. The Tavern Drinks table is original homebrew content.

---

Made with ⚔️ for [homebrewdnd.com](https://homebrewdnd.com)
