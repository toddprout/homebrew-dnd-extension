const fs = require('fs');

function generateAllPossibleNames(prefixes, suffixes) {
  const names = [];
  const maxPossible = prefixes.length * suffixes.length;
  
  console.log(`Generating ALL ${maxPossible} possible names from ${prefixes.length} prefixes × ${suffixes.length} suffixes`);
  
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      names.push(prefix + suffix);
    }
  }
  
  console.log(`Generated ${names.length} unique names`);
  return names;
}

const races = {
  human: {
    prefixes: ['Ash', 'Black', 'Crom', 'Duns', 'Fair', 'Gold', 'Hart', 'Iron', 'King', 'Long', 'Mill', 'North', 'Oak', 'River', 'Stone', 'White', 'Wild', 'Winter', 'Young', 'Bright', 'Red', 'Brown', 'Green', 'Blue', 'Grey', 'Dark', 'Light', 'High', 'Low', 'New', 'Old', 'East', 'West', 'South', 'Cross', 'Tower', 'Castle', 'Church', 'Forest', 'Lake'],
    suffixes: ['ford', 'wood', 'well', 'worth', 'weather', 'smith', 'field', 'ton', 'ham', 'shire', 'bridge', 'hill', 'dale', 'moor', 'wick', 'burn', 'thorpe', 'by', 'gate', 'haven', 'bury', 'stead', 'land', 'marsh', 'brook', 'stream', 'ridge', 'mount', 'port', 'bay', 'grove', 'glen', 'vale', 'hollow', 'meadow', 'downs', 'heath', 'mead', 'leigh', 'hurst']
  },
  elf: {
    prefixes: ['Moon', 'Star', 'Dawn', 'Silver', 'Night', 'Sun', 'Mist', 'Wind', 'Song', 'Dream', 'Light', 'Shadow', 'Frost', 'Sage', 'Wild', 'Ancient', 'High', 'Deep', 'Swift', 'Bright', 'Golden', 'Crystal', 'Pearl', 'Jade', 'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Twilight', 'Aurora', 'Whisper', 'Echo', 'Shimmer', 'Glimmer', 'Sparkle', 'Gleam', 'Radiant', 'Ethereal', 'Mystic', 'Arcane'],
    suffixes: ['whisper', 'weaver', 'tracker', 'frond', 'hollow', 'blade', 'song', 'dance', 'walker', 'rider', 'born', 'heart', 'eye', 'hand', 'leaf', 'bow', 'arrow', 'wind', 'light', 'star', 'moon', 'sun', 'fire', 'water', 'earth', 'air', 'spirit', 'soul', 'dream', 'vision', 'grace', 'beauty', 'wisdom', 'lore', 'magic', 'spell', 'charm', 'enchant', 'wonder', 'marvel']
  },
  dwarf: {
    prefixes: ['Iron', 'Stone', 'Gold', 'Fire', 'Battle', 'Hammer', 'Forge', 'Steel', 'Bronze', 'Silver', 'Rock', 'Mountain', 'Deep', 'Strong', 'Bold', 'Mighty', 'Stout', 'Thick', 'Heavy', 'Hard', 'Copper', 'Tin', 'Lead', 'Platinum', 'Adamant', 'Mithril', 'Coal', 'Diamond', 'Gem', 'Crystal', 'Thunder', 'Storm', 'War', 'Shield', 'Armor', 'Sword', 'Axe', 'Mace', 'Spear', 'Clan'],
    suffixes: ['forge', 'hammer', 'vein', 'beard', 'born', 'fist', 'axe', 'shield', 'helm', 'boot', 'pick', 'striker', 'breaker', 'maker', 'guard', 'ward', 'hold', 'stone', 'metal', 'craft', 'smith', 'wright', 'worker', 'digger', 'miner', 'delver', 'tunnel', 'cavern', 'hall', 'keep', 'tower', 'wall', 'gate', 'door', 'lock', 'key', 'treasure', 'hoard', 'vault', 'chest']
  },
  halfling: {
    prefixes: ['Good', 'Under', 'Thorn', 'Hill', 'Tea', 'Apple', 'Berry', 'Green', 'Bright', 'Merry', 'Sweet', 'Honey', 'Clover', 'Daisy', 'Rose', 'Lily', 'Sage', 'Thyme', 'Mint', 'Basil', 'Butter', 'Cheese', 'Bread', 'Cake', 'Pie', 'Pudding', 'Cream', 'Sugar', 'Spice', 'Herb', 'Flower', 'Petal', 'Bloom', 'Blossom', 'Petal', 'Stem', 'Root', 'Seed', 'Fruit', 'Grain'],
    suffixes: ['barrel', 'bough', 'gage', 'topple', 'leaf', 'bottom', 'burrow', 'hill', 'meadow', 'field', 'garden', 'patch', 'grove', 'glen', 'hollow', 'brook', 'stream', 'pond', 'lane', 'path', 'walk', 'way', 'trail', 'road', 'bridge', 'gate', 'door', 'house', 'home', 'hearth', 'kitchen', 'pantry', 'cellar', 'attic', 'shed', 'barn', 'mill', 'well', 'spring', 'pool']
  },
  'half-elf': {
    prefixes: ['Grey', 'Silver', 'Dawn', 'Dusk', 'Wandering', 'Free', 'Wild', 'Swift', 'Keen', 'Bright', 'Fair', 'Noble', 'Proud', 'Bold', 'True', 'Gentle', 'Wise', 'Kind', 'Strong', 'Brave', 'Loyal', 'Honor', 'Grace', 'Hope', 'Faith', 'Joy', 'Peace', 'Love', 'Trust', 'Dream', 'Quest', 'Journey', 'Adventure', 'Destiny', 'Fate', 'Fortune', 'Luck', 'Chance', 'Wonder', 'Mystery'],
    suffixes: ['walker', 'runner', 'rider', 'song', 'heart', 'soul', 'spirit', 'wind', 'light', 'shadow', 'born', 'blood', 'kin', 'friend', 'guard', 'ward', 'keeper', 'watcher', 'seeker', 'finder', 'hunter', 'tracker', 'scout', 'guide', 'pathfinder', 'wayfinder', 'compass', 'star', 'beacon', 'torch', 'flame', 'fire', 'ember', 'spark', 'glow', 'shine', 'gleam', 'glimmer', 'twinkle', 'glitter']
  },
  'half-orc': {
    prefixes: ['Scar', 'Skull', 'Iron', 'Blood', 'Giant', 'Bone', 'Grim', 'Dark', 'Black', 'Red', 'Steel', 'Stone', 'Heavy', 'Thick', 'Brutal', 'Savage', 'Wild', 'Fierce', 'Strong', 'Mighty', 'Rage', 'Fury', 'Wrath', 'Anger', 'Pain', 'Death', 'Doom', 'Bane', 'Curse', 'Hex', 'Poison', 'Venom', 'Thorn', 'Spike', 'Claw', 'Fang', 'Talon', 'Horn', 'Tusk', 'Maw'],
    suffixes: ['red', 'splitter', 'jaw', 'fist', 'bane', 'crusher', 'breaker', 'smasher', 'ripper', 'render', 'slayer', 'killer', 'hunter', 'stalker', 'tracker', 'runner', 'fighter', 'warrior', 'berserker', 'raider', 'reaver', 'ravager', 'destroyer', 'annihilator', 'obliterator', 'decimator', 'exterminator', 'executioner', 'butcher', 'cleaver', 'chopper', 'hacker', 'slasher', 'stabber', 'piercer', 'impaler', 'skewer', 'gouger', 'maimer', 'mutilator']
  },
  tiefling: {
    prefixes: ['Infer', 'Shadow', 'Ash', 'Dusk', 'Grim', 'Dark', 'Ember', 'Flame', 'Smoke', 'Mist', 'Void', 'Night', 'Black', 'Deep', 'Hell', 'Devil', 'Demon', 'Curse', 'Bane', 'Doom', 'Spite', 'Malice', 'Hatred', 'Venom', 'Poison', 'Taint', 'Corrupt', 'Decay', 'Rot', 'Putrid', 'Foul', 'Vile', 'Wicked', 'Evil', 'Sin', 'Vice', 'Shame', 'Guilt', 'Regret', 'Sorrow'],
    suffixes: ['nas', 'mend', 'fall', 'walker', 'soul', 'heart', 'born', 'blood', 'fire', 'burn', 'scar', 'mark', 'brand', 'curse', 'bane', 'doom', 'shadow', 'dark', 'night', 'void', 'abyss', 'pit', 'chasm', 'gulf', 'maw', 'throat', 'eye', 'gaze', 'stare', 'glare', 'sneer', 'scowl', 'frown', 'grimace', 'snarl', 'growl', 'hiss', 'whisper', 'murmur', 'mutter']
  },
  gnome: {
    prefixes: ['Spark', 'Tinker', 'Bumble', 'Cogs', 'Fiddle', 'Whirr', 'Click', 'Tick', 'Buzz', 'Whiz', 'Pip', 'Zip', 'Snap', 'Pop', 'Bang', 'Boom', 'Crack', 'Clank', 'Gear', 'Spring', 'Coil', 'Wire', 'Bolt', 'Nut', 'Screw', 'Rivet', 'Pin', 'Peg', 'Lever', 'Pulley', 'Wheel', 'Axle', 'Shaft', 'Rod', 'Bar', 'Tube', 'Pipe', 'Hose', 'Cable', 'Chain'],
    suffixes: ['sprocket', 'top', 'witz', 'worth', 'fen', 'bottom', 'nozzle', 'widget', 'gadget', 'gizmo', 'thingamajig', 'doohickey', 'contraption', 'invention', 'creation', 'device', 'machine', 'engine', 'motor', 'wheel', 'gear', 'cog', 'spring', 'coil', 'wire', 'circuit', 'switch', 'button', 'lever', 'knob', 'dial', 'meter', 'gauge', 'indicator', 'display', 'screen', 'monitor', 'sensor', 'detector', 'scanner']
  },
  dragonborn: {
    prefixes: ['Kerr', 'Cleth', 'Daar', 'Prex', 'Sham', 'Tork', 'Yar', 'Zash', 'Borr', 'Donk', 'Ghesh', 'Heskan', 'Krull', 'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash', 'Tarhun', 'Torinn', 'Aerdacyn', 'Ahvain', 'Aramil', 'Aranea', 'Berris', 'Cithreth', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Ivellios', 'Laucian', 'Mindartis', 'Naal', 'Nutae', 'Paelinn', 'Peren'],
    suffixes: ['hylon', 'tinthiallor', 'dendrian', 'ijandilin', 'ekesh', 'ullhad', 'jhan', 'kul', 'inn', 'ar', 'ash', 'eth', 'oth', 'ull', 'ann', 'orr', 'edd', 'inn', 'arr', 'ash', 'yss', 'ith', 'yin', 'yan', 'yon', 'yun', 'yst', 'yth', 'yvr', 'yzz', 'axx', 'exx', 'ixx', 'oxx', 'uxx', 'azz', 'ezz', 'izz', 'ozz', 'uzz']
  },
  aarakocra: {
    prefixes: ['Sky', 'Wind', 'Cloud', 'Storm', 'Thunder', 'Lightning', 'Rain', 'Gale', 'Breeze', 'Tempest', 'Hurricane', 'Cyclone', 'Whirlwind', 'Tornado', 'Zephyr', 'Squall', 'Gust', 'Draft', 'Current', 'Flow', 'Stream', 'River', 'Torrent', 'Flood', 'Tide', 'Wave', 'Surge', 'Swell', 'Foam', 'Spray', 'Mist', 'Fog', 'Haze', 'Vapor', 'Steam', 'Smoke', 'Ash', 'Dust', 'Sand', 'Pebble'],
    suffixes: ['wing', 'feather', 'talon', 'beak', 'eye', 'flight', 'soar', 'glide', 'dive', 'swoop', 'perch', 'nest', 'roost', 'aerie', 'peak', 'summit', 'crest', 'ridge', 'cliff', 'height', 'altitude', 'elevation', 'ascent', 'descent', 'spiral', 'circle', 'loop', 'arc', 'curve', 'bend', 'turn', 'twist', 'spin', 'whirl', 'swirl', 'eddy', 'vortex', 'maelstrom', 'whirlpool', 'cyclone']
  },
  genasi: {
    prefixes: ['Fire', 'Water', 'Earth', 'Air', 'Storm', 'Flame', 'Wave', 'Stone', 'Wind', 'Ember', 'Frost', 'Quake', 'Gale', 'Magma', 'Glacier', 'Boulder', 'Zephyr', 'Blaze', 'Torrent', 'Granite', 'Lava', 'Ice', 'Snow', 'Hail', 'Sleet', 'Rain', 'Dew', 'Mist', 'Fog', 'Cloud', 'Lightning', 'Thunder', 'Spark', 'Flash', 'Bolt', 'Shock', 'Current', 'Charge', 'Power', 'Energy'],
    suffixes: ['born', 'touched', 'blessed', 'marked', 'sworn', 'bound', 'wielder', 'caller', 'speaker', 'walker', 'rider', 'dancer', 'singer', 'keeper', 'guard', 'ward', 'heart', 'soul', 'spirit', 'essence', 'core', 'center', 'focus', 'nexus', 'hub', 'axis', 'pivot', 'anchor', 'foundation', 'base', 'root', 'source', 'origin', 'beginning', 'start', 'genesis', 'birth', 'creation', 'formation', 'emergence']
  },
  goliath: {
    prefixes: ['Stone', 'Mountain', 'Peak', 'Summit', 'Cliff', 'Rock', 'Boulder', 'Granite', 'Marble', 'Slate', 'Flint', 'Iron', 'Steel', 'Bronze', 'Copper', 'Silver', 'Gold', 'Platinum', 'Adamant', 'Mithril', 'Crystal', 'Quartz', 'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Topaz', 'Amethyst', 'Opal', 'Pearl', 'Obsidian', 'Onyx', 'Jade', 'Amber', 'Coral', 'Ivory', 'Bone', 'Horn', 'Tusk', 'Claw'],
    suffixes: ['peak', 'summit', 'crest', 'ridge', 'cliff', 'face', 'wall', 'slope', 'path', 'trail', 'pass', 'gap', 'gorge', 'canyon', 'valley', 'hollow', 'cave', 'cavern', 'grotto', 'chamber', 'hall', 'room', 'vault', 'tomb', 'crypt', 'mound', 'hill', 'knoll', 'rise', 'elevation', 'height', 'altitude', 'ascent', 'climb', 'scale', 'reach', 'grasp', 'hold', 'grip', 'clench']
  }
};

const entries = [];

for (const race in races) {
  console.log(`\nProcessing ${race}...`);
  const { prefixes, suffixes } = races[race];
  const names = generateAllPossibleNames(prefixes, suffixes); // Generate ALL possible combinations
  names.forEach(name => entries.push({ name, race: [race] }));
  console.log(`Added ${names.length} names for ${race}`);
}

const json = {
  name: "NPC Last Names",
  description: "Last names/clan names tagged by race for NPC generation",
  entries
};

fs.writeFileSync('data/npc/names-last.json', JSON.stringify(json, null, 2));
console.log(`\nGenerated ${entries.length} total last names!`);