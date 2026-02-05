/**
 * Homebrew DND - NPC Generator
 * Generates random NPCs with customizable attributes
 */

// ============================================
// DATA LOADING
// ============================================

/**
 * GitHub Pages base URL for NPC data files
 */
const NPC_DATA_BASE_URL = 'https://toddprout.github.io/homebrew-dnd-extension/data/npc';

// Cache for static data (names, occupations, etc.) - these don't need to change
let staticNpcData = null;

// Manifests for split files (so we know what chunks exist)
let appearancesManifest = null;
let personalitiesManifest = null;

/**
 * Load a single JSON file from GitHub
 */
async function loadNPCFile(filename) {
  try {
    const url = `${NPC_DATA_BASE_URL}/${filename}`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error(`Failed to load ${filename}:`, error);
  }
  return null;
}

/**
 * Load manifest for split files
 */
async function loadManifest(baseName) {
  try {
    const manifestUrl = `${NPC_DATA_BASE_URL}/${baseName}-split/manifest.json`;
    const response = await fetch(manifestUrl);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`No manifest found for ${baseName}`);
  }
  return null;
}

/**
 * Load a random chunk from split files
 */
async function loadRandomChunk(baseName, manifest) {
  if (!manifest || !manifest.chunks || manifest.chunks.length === 0) {
    // Try loading single file as fallback
    return await loadNPCFile(`${baseName}.json`);
  }
  
  // Randomly pick a chunk
  const randomIndex = Math.floor(Math.random() * manifest.chunks.length);
  const chunkName = manifest.chunks[randomIndex];
  const chunkFileName = typeof chunkName === 'string' ? chunkName : chunkName.name;
  
  const url = `${NPC_DATA_BASE_URL}/${baseName}-split/${chunkFileName}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error(`Failed to load chunk ${chunkFileName}`);
    return null;
  }
  
  const chunkData = await response.json();
  
  // Remove chunk metadata
  delete chunkData._chunk;
  delete chunkData._arrayKey;
  delete chunkData._arrayPart;
  
  return chunkData;
}

/**
 * Load static NPC data (names, occupations, etc.) - cached
 */
async function loadStaticNPCData() {
  if (staticNpcData) return staticNpcData;
  
  const regularFiles = {
    firstNames: 'names-first.json',
    lastNames: 'names-last.json',
    occupations: 'occupations.json',
    voices: 'voices.json',
    secrets: 'secrets.json',
    bonds: 'bonds.json',
    moods: 'moods.json',
    ages: 'ages.json'
  };
  
  const results = {};
  
  // Load regular files
  await Promise.all(
    Object.entries(regularFiles).map(async ([key, filename]) => {
      results[key] = await loadNPCFile(filename);
    })
  );
  
  // Load manifests for split files
  appearancesManifest = await loadManifest('appearances');
  personalitiesManifest = await loadManifest('personalities');
  
  staticNpcData = results;
  return staticNpcData;
}

/**
 * Load fresh appearances and personalities data (random chunks)
 */
async function loadFreshVariableData() {
  const [appearances, personalities] = await Promise.all([
    loadRandomChunk('appearances', appearancesManifest),
    loadRandomChunk('personalities', personalitiesManifest)
  ]);
  
  return { appearances, personalities };
}

// Legacy function for compatibility
async function loadNPCData() {
  const staticData = await loadStaticNPCData();
  const variableData = await loadFreshVariableData();
  return { ...staticData, ...variableData };
}

// ============================================
// RANDOM HELPERS
// ============================================

function randomFrom(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function randomFromFiltered(array, filterFn) {
  const filtered = array.filter(filterFn);
  return randomFrom(filtered.length > 0 ? filtered : array);
}

// ============================================
// GENERATOR FUNCTIONS
// ============================================

const RACES = ['human', 'elf', 'dwarf', 'halfling', 'half-orc', 'tiefling', 'gnome', 'dragonborn'];
const GENDERS = ['male', 'female', 'neutral'];

function generateRace() {
  // Weighted towards humans
  const weights = {
    'human': 40,
    'elf': 12,
    'dwarf': 12,
    'halfling': 10,
    'half-orc': 8,
    'tiefling': 6,
    'gnome': 6,
    'dragonborn': 6
  };
  
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (const [race, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return race;
  }
  
  return 'human';
}

function generateGender() {
  const roll = Math.random();
  if (roll < 0.45) return 'male';
  if (roll < 0.90) return 'female';
  return 'neutral';
}

function generateName(data, race, gender) {
  if (!data.firstNames || !data.lastNames) {
    return { first: 'Unknown', last: 'Stranger', full: 'Unknown Stranger' };
  }
  
  const firstName = randomFromFiltered(
    data.firstNames.entries,
    (n) => n.race.includes(race) && n.gender.includes(gender)
  );
  
  const lastName = randomFromFiltered(
    data.lastNames.entries,
    (n) => n.race.includes(race)
  );
  
  const first = firstName?.name || 'Unknown';
  const last = lastName?.name || '';
  
  return {
    first,
    last,
    full: last ? `${first} ${last}` : first
  };
}

function generateAge(data, race) {
  if (!data.ages || !data.ages.categories) {
    return { label: 'Adult', description: 'In the prime of life', years: '' };
  }
  
  const category = randomFrom(data.ages.categories);
  const range = category.ranges[race] || category.ranges['human'];
  
  return {
    label: category.label,
    description: category.description,
    years: range
  };
}

function generateOccupation(data) {
  if (!data.occupations || !data.occupations.entries) {
    return { occupation: 'Commoner', class: 'commoner', tags: [] };
  }
  
  return randomFrom(data.occupations.entries);
}

function generateAppearance(data) {
  if (!data.appearances) {
    return {
      build: 'Average build',
      face: 'Unremarkable features',
      hair: 'Common hair',
      eyes: 'Normal eyes',
      distinguishing: 'Nothing notable',
      summary: 'An unremarkable-looking person.'
    };
  }
  
  const app = data.appearances;
  const build = randomFrom(app.build) || 'Average build';
  const face = randomFrom(app.face) || 'Unremarkable features';
  const hair = randomFrom(app.hair) || 'Common hair';
  const eyes = randomFrom(app.eyes) || 'Normal eyes';
  const distinguishing = randomFrom(app.distinguishing) || 'Nothing notable';
  
  return {
    build,
    face,
    hair,
    eyes,
    distinguishing,
    summary: `${build}. ${face}. ${hair}. ${eyes}. ${distinguishing}.`
  };
}

function generateVoice(data) {
  if (!data.voices || !data.voices.entries) {
    return { voice: 'Normal voice', pattern: 'speaks plainly', summary: 'Normal voice, speaks plainly' };
  }
  
  const voice = randomFrom(data.voices.entries);
  return {
    voice: voice.voice,
    pattern: voice.pattern,
    summary: `${voice.voice}, ${voice.pattern}`
  };
}

function generatePersonality(data) {
  if (!data.personalities) {
    return { traits: ['Unremarkable'], summary: 'Unremarkable personality' };
  }
  
  const p = data.personalities;
  const traits = [];
  
  // Pick 1-2 traits from different categories
  const categories = [p.positive, p.neutral, p.negative].filter(c => c && c.length > 0);
  const numTraits = Math.random() < 0.6 ? 2 : 1;
  
  const usedCategories = new Set();
  for (let i = 0; i < numTraits && categories.length > 0; i++) {
    let catIndex;
    do {
      catIndex = Math.floor(Math.random() * categories.length);
    } while (usedCategories.has(catIndex) && usedCategories.size < categories.length);
    
    usedCategories.add(catIndex);
    traits.push(randomFrom(categories[catIndex]));
  }
  
  return {
    traits,
    summary: traits.join(', ')
  };
}

function generateQuirk(existingQuirksData) {
  // Use the existing npc-quirks.json data if available
  if (existingQuirksData && existingQuirksData.entries) {
    const entry = randomFrom(existingQuirksData.entries);
    return entry?.result || 'No notable quirks';
  }
  return 'No notable quirks';
}

function generateSecret(data) {
  if (!data.secrets || !data.secrets.entries) {
    return { secret: 'Has no notable secrets', severity: 'none' };
  }
  
  const secret = randomFrom(data.secrets.entries);
  return {
    secret: secret.secret,
    severity: secret.severity
  };
}

function generateBond(data) {
  if (!data.bonds || !data.bonds.entries) {
    return { bond: 'Has no strong bonds', type: 'none' };
  }
  
  const bond = randomFrom(data.bonds.entries);
  return {
    bond: bond.bond,
    type: bond.type
  };
}

function generateMood(data) {
  if (!data.moods || !data.moods.entries) {
    return { mood: 'Neutral', description: 'Showing no particular emotion' };
  }
  
  const mood = randomFrom(data.moods.entries);
  return {
    mood: mood.mood,
    description: mood.description
  };
}

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Generate a complete NPC
 * @param {object} options - Generation options
 * @param {string} options.race - Specific race or null for random
 * @param {string} options.gender - Specific gender or null for random
 * @param {object} options.locked - Object of locked fields with their values
 * @param {string} options.detail - 'quick', 'standard', or 'full'
 * @param {object} quirksData - Existing quirks data from main data load
 */
async function generateNPC(options = {}, quirksData = null) {
  // Load static data (cached) and fresh variable data (new random chunks each time)
  const staticData = await loadStaticNPCData();
  const variableData = await loadFreshVariableData();
  const data = { ...staticData, ...variableData };
  
  const locked = options.locked || {};
  const detail = options.detail || 'standard';
  
  // Generate or use locked values
  const race = locked.race || options.race || generateRace();
  const gender = locked.gender || options.gender || generateGender();
  const name = locked.name || generateName(data, race, gender);
  const age = locked.age || generateAge(data, race);
  const occupation = locked.occupation || generateOccupation(data);
  const appearance = locked.appearance || generateAppearance(data);
  const voice = locked.voice || generateVoice(data);
  const personality = locked.personality || generatePersonality(data);
  const mood = locked.mood || generateMood(data);
  
  // Base NPC (always included)
  const npc = {
    name,
    race,
    gender,
    age,
    occupation,
    appearance,
    voice,
    personality,
    mood
  };
  
  // Add quirk for standard and full
  if (detail === 'standard' || detail === 'full') {
    npc.quirk = locked.quirk || generateQuirk(quirksData);
  }
  
  // Add secret and bond for full detail
  if (detail === 'full') {
    npc.secret = locked.secret || generateSecret(data);
    npc.bond = locked.bond || generateBond(data);
  }
  
  return npc;
}

/**
 * Regenerate a single field of an existing NPC
 */
async function regenerateField(npc, field, quirksData = null) {
  const data = await loadNPCData();
  
  switch (field) {
    case 'race':
      return generateRace();
    case 'gender':
      return generateGender();
    case 'name':
      return generateName(data, npc.race, npc.gender);
    case 'age':
      return generateAge(data, npc.race);
    case 'occupation':
      return generateOccupation(data);
    case 'appearance':
      return generateAppearance(data);
    case 'voice':
      return generateVoice(data);
    case 'personality':
      return generatePersonality(data);
    case 'quirk':
      return generateQuirk(quirksData);
    case 'secret':
      return generateSecret(data);
    case 'bond':
      return generateBond(data);
    case 'mood':
      return generateMood(data);
    default:
      return null;
  }
}

/**
 * Format NPC as copyable text
 */
function formatNPCAsText(npc) {
  let text = `**${npc.name.full}**\n`;
  text += `${npc.age.label} ${npc.gender} ${npc.race}, ${npc.occupation.occupation}\n\n`;
  
  text += `**Appearance:** ${npc.appearance.summary}\n\n`;
  text += `**Voice:** ${npc.voice.summary}\n\n`;
  text += `**Personality:** ${npc.personality.summary}\n\n`;
  text += `**Current Mood:** ${npc.mood.mood} - ${npc.mood.description}\n`;
  
  if (npc.quirk) {
    text += `\n**Quirk:** ${npc.quirk}\n`;
  }
  
  if (npc.secret) {
    text += `\n**Secret:** ${npc.secret.secret}\n`;
  }
  
  if (npc.bond) {
    text += `\n**Bond:** ${npc.bond.bond}\n`;
  }
  
  return text;
}

// Export for use in other scripts
window.NPCGenerator = {
  loadNPCData,
  generateNPC,
  regenerateField,
  formatNPCAsText,
  RACES,
  GENDERS
};