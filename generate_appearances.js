const fs = require('fs');

// Component parts for generating varied appearance descriptions
const components = {
  build: {
    height: ['Tall', 'Short', 'Average height', 'Towering', 'Diminutive', 'Statuesque', 'Compact', 'Lanky', 'Petite', 'Imposing', 'Giant-like', 'Child-sized', 'Unusually tall', 'Remarkably short', 'Medium height', 'Above average', 'Below average', 'Extremely tall', 'Very short', 'Moderately tall', 'Slightly short', 'Impressively tall', 'Strikingly short', 'Towering over others', 'Barely five feet', 'Well over six feet', 'Under five feet', 'Nearly seven feet', 'Just over four feet', 'Exceptionally tall'],
    frame: ['and lanky', 'and stocky', 'with a muscular build', 'with broad shoulders', 'and wiry', 'and delicate', 'and imposing', 'and frail', 'and athletic', 'and heavyset', 'with a slim build', 'and rotund', 'with a robust frame', 'and gaunt', 'with a sturdy build', 'and willowy', 'with a compact frame', 'and gangly', 'with a powerful build', 'and lithe', 'with a barrel chest', 'and sinewy', 'with a lean physique', 'and portly', 'with wide hips', 'and emaciated', 'with narrow shoulders', 'and burly', 'with a runner\'s build', 'and corpulent', 'with a swimmer\'s physique', 'and skeletal', 'with thick limbs', 'and spindly', 'with a wrestler\'s build', 'and pear-shaped', 'with a dancer\'s frame', 'and bulky', 'with long limbs', 'and squat', 'with a gymnast\'s build', 'and hefty', 'with a bony frame', 'and chunky', 'with a solid build', 'and stringy', 'with a fighter\'s physique', 'and plump', 'with a laborer\'s build', 'and scrawny', 'with an imposing mass', 'and stick-thin', 'with a powerful frame', 'and husky', 'with a slight build', 'and beefy', 'with a graceful form', 'and paunchy', 'with a formidable presence', 'and reedy'],
    modifiers: ['', ', almost intimidating', ', surprisingly agile', ', deceptively strong', ', built for endurance', ', commanding presence', ', unassuming stature', ', battle-hardened', ', weathered by time', ', youthful vigor', ', aged grace', ', imposing figure', ', unremarkable appearance', ', catching the eye', ', easy to overlook', ', difficult to ignore', ', memorable silhouette', ', forgettable form', ', striking profile', ', intimidating aura', ', gentle countenance', ', fierce demeanor', ', peaceful bearing', ', aggressive stance', ', defensive posture', ', confident carriage', ', timid appearance', ', bold presence', ', subtle form', ', obvious strength', ', hidden power', ', raw physicality', ', refined elegance']
  },
  face: {
    shape: ['Sharp, angular features', 'Soft, rounded face', 'Square-jawed', 'Heart-shaped face', 'Long and narrow features', 'Broad face', 'Delicate features', 'Strong, chiseled features', 'Asymmetrical features', 'Oval face', 'Distinguished features', 'Forgettable features', 'Striking features', 'Pleasant features', 'Severe features', 'Diamond-shaped face', 'Triangular features', 'Rectangular face', 'Elfin features', 'Rugged features', 'Refined features', 'Coarse features', 'Gentle features', 'Harsh features', 'Smooth features', 'Craggy features', 'Youthful face', 'Aged visage', 'Weathered countenance', 'Fresh-faced', 'Careworn features', 'Aristocratic features', 'Common features', 'Exotic features', 'Handsome features', 'Homely features', 'Beautiful face', 'Plain face', 'Memorable visage', 'Unremarkable features', 'Kindly face', 'Cruel features', 'Wise countenance', 'Foolish appearance', 'Noble features', 'Brutish face'],
    condition: ['', 'weather-beaten and lined', 'youthful and smooth', 'scarred across one cheek', 'pockmarked', 'freckled', 'sun-kissed', 'pale and unblemished', 'with visible scars', 'wrinkled with age', 'with laugh lines', 'with a prominent birthmark', 'with a fresh scar', 'with old burn marks', 'with ritual markings', 'with faded tattoos', 'deeply tanned', 'alabaster white', 'ruddy complexion', 'sallow skin', 'olive-toned', 'ashen', 'flushed', 'bronzed', 'with acne scars', 'with port wine stain', 'with vitiligo patches', 'with age spots', 'with freckles everywhere', 'completely smooth', 'with worry lines', 'with frown lines', 'with smile lines', 'with crow\'s feet', 'with forehead creases', 'with nasolabial folds', 'with dimpled cheeks', 'with sunken temples', 'with prominent veins', 'with rosy cheeks', 'with windburned skin', 'with frost-nipped nose', 'with peeling sunburn', 'with a rash', 'with eczema patches', 'with psoriasis', 'with moles scattered across'],
    details: ['', 'with high cheekbones', 'with pudgy cheeks', 'gaunt and hollow', 'with a strong jaw', 'with a weak chin', 'with dimples', 'with a double chin', 'with sunken cheeks', 'with a pointed chin', 'with a cleft chin', 'with a rounded chin', 'with sharp cheekbones', 'with full cheeks', 'with jowls', 'with a lantern jaw', 'with a receding chin', 'with prominent cheekbones', 'with flat cheeks', 'with a jutting jaw', 'with a small chin', 'with a large chin', 'with a square chin', 'with apple cheeks', 'with hollow temples', 'with a broad forehead', 'with a narrow forehead', 'with a high forehead', 'with a low forehead', 'with a sloping forehead', 'with a prominent brow ridge', 'with a smooth brow', 'with a furrowed brow', 'with bushy eyebrows', 'with thin eyebrows', 'with arched eyebrows', 'with straight eyebrows', 'with a unibrow', 'with no eyebrows', 'with plucked eyebrows']
  },
  hair: {
    length: ['Long', 'Short', 'Shoulder-length', 'Cropped', 'Flowing', 'Waist-length', 'Chin-length', 'Medium-length', 'Buzzed', 'Extremely long', 'Very short', 'Neck-length', 'Ear-length', 'Hip-length', 'Down to mid-back', 'Just past shoulders', 'Collar-length', 'Close-cropped', 'Military cut', 'Pixie cut', 'Bob-length', 'Ankle-length', 'Floor-length', 'Crew cut', 'Stubble-length', 'Barely there', 'Growing out'],
    texture: ['flowing hair', 'curly hair', 'straight hair', 'wavy hair', 'kinky hair', 'wild and unkempt hair', 'sleek hair', 'frizzy hair', 'coarse hair', 'fine hair', 'thick locks', 'thinning hair', 'silky hair', 'wiry hair', 'brittle hair', 'lustrous hair', 'dull hair', 'oily hair', 'dry hair', 'matted hair', 'tangled hair', 'smooth hair', 'rough hair', 'bouncy hair', 'limp hair', 'voluminous hair', 'flat hair', 'springy curls', 'loose waves', 'tight coils', 'ringlets', 'corkscrew curls', 'beach waves', 'crimped hair', 'permed hair', 'processed hair', 'natural hair', 'damaged hair', 'healthy hair', 'split ends'],
    color: ['', 'as black as night', 'golden blonde', 'fiery red', 'deep brown', 'silvery gray', 'pure white', 'auburn', 'strawberry blonde', 'jet black', 'salt and pepper', 'platinum blonde', 'chestnut brown', 'copper-toned', 'ash blonde', 'dark brown', 'light brown', 'dirty blonde', 'honey blonde', 'caramel', 'mahogany', 'burgundy', 'blue-black', 'raven', 'ebony', 'charcoal', 'slate gray', 'steel gray', 'silver-white', 'snow white', 'ice blonde', 'butter blonde', 'sand blonde', 'wheat blonde', 'rose gold', 'ginger', 'rust-colored', 'cinnamon', 'titian', 'crimson', 'scarlet', 'vermillion', 'magenta', 'purple', 'blue', 'green', 'pink', 'orange', 'rainbow-hued', 'multi-colored'],
    style: ['', 'pulled back in a ponytail', 'neatly braided', 'in elaborate braids', 'hidden under a hood', 'tied in a bun', 'with a widow\'s peak', 'graying at the temples', 'with streaks of color', 'in dreadlocks', 'in cornrows', 'shaved on one side', 'in a topknot', 'with beads woven in', 'in a mohawk', 'slicked back', 'parted down the middle', 'parted to the side', 'combed forward', 'swept back', 'in a chignon', 'in a French braid', 'in pigtails', 'in two braids', 'in multiple braids', 'adorned with flowers', 'woven with ribbons', 'decorated with gems', 'held with a circlet', 'tied with leather', 'in a messy bun', 'in a high ponytail', 'in a low ponytail', 'in a side ponytail', 'half up, half down', 'in victory rolls', 'in pin curls', 'teased high', 'feathered back', 'with bangs', 'with side-swept bangs', 'with blunt bangs', 'without bangs', 'finger-combed', 'carefully coiffed', 'artfully disheveled', 'with shaved designs'],
    special: ['Shaved bald', 'Bald with a fringe', 'Receding hairline', 'Completely hairless', 'Patchy baldness', 'Tonsured', 'Bright, unusual color', 'Balding on top', 'Horseshoe pattern baldness', 'Shaved head with tattoos', 'Bald and polished', 'Male pattern baldness', 'Alopecia patches', 'Crown of baldness', 'Widow\'s peak baldness', 'Clean-shaven head', 'Shaved except for topknot', 'Shaved with stubble', 'Recently shaved', 'Growing back from shaved', 'Sparse hair coverage']
  },
  eyes: {
    color: ['Piercing blue eyes', 'Warm brown eyes', 'Bright green eyes', 'Hazel eyes', 'Gray eyes', 'Amber eyes', 'Dark eyes', 'Pale blue eyes', 'Violet eyes', 'Golden eyes', 'Black eyes', 'Steel gray eyes', 'Emerald green eyes', 'Honey-colored eyes', 'Icy blue eyes', 'Deep blue eyes', 'Light blue eyes', 'Sapphire eyes', 'Azure eyes', 'Cobalt eyes', 'Dark brown eyes', 'Light brown eyes', 'Chocolate brown eyes', 'Espresso eyes', 'Mahogany eyes', 'Forest green eyes', 'Jade eyes', 'Olive eyes', 'Sea green eyes', 'Mint green eyes', 'Slate gray eyes', 'Stormy gray eyes', 'Silver eyes', 'Ash gray eyes', 'Topaz eyes', 'Citrine eyes', 'Copper eyes', 'Bronze eyes', 'Tawny eyes', 'Obsidian eyes', 'Onyx eyes', 'Coal black eyes', 'Ink black eyes', 'Purple eyes', 'Lavender eyes', 'Amethyst eyes', 'Red-tinted eyes', 'Yellow eyes', 'Cat-like yellow eyes', 'White eyes', 'Colorless eyes', 'Milky white eyes', 'Cloudy eyes', 'Crystalline eyes', 'Luminous eyes'],
    condition: ['', 'one eye clouded', 'one eye missing', 'with heterochromia', 'bloodshot', 'perpetually tired-looking', 'clear and bright', 'with cataracts', 'with an eye patch', 'with dark circles beneath', 'with crow\'s feet', 'with heavy bags', 'with a permanent squint', 'rheumy', 'watery', 'with a glass eye', 'both eyes clouded', 'completely blind', 'with a milky film', 'yellowed', 'with burst blood vessels', 'with pink eye', 'with a lazy eye', 'cross-eyed', 'wall-eyed', 'with dilated pupils', 'with pinpoint pupils', 'with uneven pupils', 'with slitted pupils', 'with round pupils', 'with glowing effect', 'with reflective quality', 'with strange coloration in one', 'with sunken appearance', 'with bulging appearance', 'with hooded lids', 'with drooping lids', 'with no lashes', 'with long lashes', 'with thick lashes', 'with sparse lashes', 'with scarred eyelid', 'with tattooed eyelids', 'with twitching eyelid'],
    expression: ['', 'shifty, darting gaze', 'wide and innocent', 'narrow and calculating', 'intense stare', 'gentle gaze', 'suspicious glare', 'vacant stare', 'keen and observant', 'sad and distant', 'twinkling with mirth', 'cold and unfeeling', 'warm and inviting', 'haunted look', 'predatory gaze', 'kind look', 'cruel stare', 'piercing gaze', 'unfocused stare', 'penetrating look', 'dismissive glance', 'curious gaze', 'bored expression', 'excited look', 'fearful eyes', 'confident stare', 'nervous glances', 'steady gaze', 'unwavering stare', 'avoidant look', 'direct gaze', 'sidelong glances', 'downcast eyes', 'heavenward gaze', 'thousand-yard stare', 'wise look', 'foolish expression', 'angry glare', 'loving gaze', 'hateful stare', 'indifferent look', 'passionate eyes', 'dead-eyed stare', 'lively sparkle', 'dull lack of expression', 'smoldering intensity']
  },
  distinguishing: {
    facial: ['A prominent nose', 'A crooked nose', 'A button nose', 'A hooked nose', 'Missing several teeth', 'A gold tooth that glints', 'Perfect white teeth', 'Gap-toothed smile', 'A distinctive mole', 'A memorable tattoo', 'Facial piercings', 'A thick beard', 'A well-groomed mustache', 'Cleanly shaven', 'Stubble', 'An elaborate earring', 'Cauliflower ears', 'Pointed ears', 'Large ears', 'Unusually small ears', 'A Roman nose', 'An upturned nose', 'A flat nose', 'A broken nose', 'A bulbous nose', 'A thin nose', 'A wide nose', 'Flared nostrils', 'A crooked smile', 'Thin lips', 'Full lips', 'A scar through the lip', 'Chapped lips', 'Painted lips', 'A beauty mark', 'Multiple moles', 'A port wine stain', 'A cleft palate', 'A harelip', 'Silver teeth', 'Blackened teeth', 'Broken teeth', 'Fanged teeth', 'Filed teeth', 'No teeth', 'Braces', 'Grills', 'Tusks', 'Multiple earrings', 'Gauged ears', 'Torn earlobe', 'Nose ring', 'Eyebrow ring', 'Lip ring', 'Cheek piercings', 'Bridge piercing', 'Full beard', 'Goatee', 'Van Dyke', 'Handlebar mustache', 'Fu Manchu', 'Soul patch'],
    body: ['Calloused, working hands', 'Immaculately manicured nails', 'Missing a finger', 'Extra digits', 'Delicate hands', 'Scarred knuckles', 'Long, artistic fingers', 'Stained fingertips', 'Weathered hands', 'Soft, uncalloused hands', 'Tattooed arms', 'Muscular arms', 'Thin arms', 'One arm shorter', 'Scarred forearms', 'Web-fingered', 'Gnarled hands', 'Trembling hands', 'Steady hands', 'Ink-stained fingers', 'Missing fingernails', 'Long fingernails', 'Painted nails', 'Bitten nails', 'Ring-covered fingers', 'Knobby knuckles', 'Double-jointed fingers', 'Clubbed fingers', 'Arthritic hands', 'Burned hands', 'Frost-damaged fingers', 'Pox-scarred arms', 'Track-marked arms', 'Rope-burned wrists', 'Shackle scars', 'Brand mark', 'Full body tattoos', 'Ritual scarification', 'Henna patterns', 'Birth defects', 'War wounds', 'Missing limb', 'Prosthetic limb', 'Wooden leg', 'Hook hand', 'Eye patch', 'Head bandage', 'Arm sling', 'Neck brace', 'Walking cane', 'Crutches', 'Wheelchair', 'Hunched back', 'Twisted spine', 'Pigeon-toed', 'Bowlegged', 'Knock-kneed', 'Club foot', 'Six fingers', 'Webbed toes'],
    movement: ['A noticeable limp', 'Moves with grace', 'Walks with a swagger', 'Shuffles when walking', 'Bounces when walking', 'Military bearing', 'Stooped posture', 'Ramrod straight posture', 'Relaxed posture', 'Twitchy movements', 'Deliberate, slow movements', 'Quick, nervous movements', 'Fluid movements', 'Stiff gait', 'Elegant carriage', 'Clumsy gait', 'Confident stride', 'Hesitant steps', 'Heavy footfalls', 'Light footsteps', 'Silent movement', 'Loud walking', 'Drags one foot', 'Hops slightly', 'Rolls hips when walking', 'Swings arms widely', 'Keeps arms still', 'Hunched shoulders', 'Squared shoulders', 'Slumped shoulders', 'Prowling gait', 'Marching step', 'Mincing steps', 'Long strides', 'Short steps', 'Pigeon-toed walk', 'Knock-kneed walk', 'Bowlegged gait', 'Sways when walking', 'Stumbles frequently', 'Never trips', 'Dancelike movements', 'Jerky motions', 'Smooth gestures', 'Wild gesticulations', 'Restrained movements', 'Fidgets constantly', 'Perfectly still', 'Paces nervously', 'Leans to one side', 'Favors one leg', 'Walks on tiptoes', 'Flat-footed walk', 'Heel-striker', 'Toe-walker', 'Skips sometimes', 'Never hurries', 'Always rushing'],
    sensory: ['Always smells faintly of herbs', 'Smells of smoke', 'Perfumed scent', 'Smells of leather', 'Smells of sea salt', 'Earthy scent', 'Floral fragrance', 'Acrid smell', 'Smells of incense', 'Fresh, clean scent', 'Musty odor', 'Spicy aroma', 'Smells of animals', 'Chemical smell', 'No discernible scent', 'Reeks of alcohol', 'Smells of sweat', 'Cologne-drenched', 'Smells of baking bread', 'Metallic scent', 'Blood smell', 'Antiseptic scent', 'Medicinal odor', 'Smells of old books', 'Library smell', 'Woody aroma', 'Pine scent', 'Citrus fragrance', 'Vanilla scent', 'Cinnamon smell', 'Smells of coffee', 'Tea-scented', 'Wine bouquet', 'Beer smell', 'Tobacco scent', 'Pipe smoke aroma', 'Cigar smell', 'Cooking spices', 'Garlic breath', 'Mint-fresh breath', 'Bad breath', 'Sweet breath', 'Sour smell', 'Rancid odor', 'Decay smell', 'Rot stench', 'Mildew odor', 'Wet dog smell', 'Horse smell', 'Barn odor', 'Manure scent', 'Fish smell', 'Ocean breeze', 'Mountain air', 'Desert dust smell', 'Rain scent', 'Petrichor aroma', 'Ozone smell'],
    misc: ['A nervous twitch', 'Speaks with a lisp', 'Stutters slightly', 'Deep, booming voice', 'High-pitched voice', 'Raspy voice', 'Melodious voice', 'Gravelly voice', 'Soft-spoken', 'Loud and brash', 'Constantly sniffling', 'Frequent coughing', 'Distinctive laugh', 'Never smiles', 'Always smiling', 'Wheezes when breathing', 'Snores loudly', 'Grinds teeth', 'Clicks tongue', 'Pops knuckles', 'Cracks neck', 'Drums fingers', 'Taps foot', 'Bounces leg', 'Bites nails', 'Chews lip', 'Scratches head', 'Rubs nose', 'Touches face', 'Plays with hair', 'Adjusts clothing', 'Checks pocket watch', 'Squints often', 'Blinks rapidly', 'Winks habitually', 'Raises eyebrows', 'Furrows brow', 'Wrinkles nose', 'Flares nostrils', 'Purses lips', 'Licks lips', 'Bites tongue', 'Sighs heavily', 'Gasps frequently', 'Clears throat', 'Hums tunelessly', 'Whistles', 'Sings', 'Mutters', 'Talks to self', 'Echoes others', 'Mimics voices', 'Heavy accent', 'Foreign accent', 'Regional accent', 'Speech impediment', 'Missing tongue']
  }
};

function generateBuilds() {
  const builds = new Set();
  const { height, frame, modifiers } = components.build;
  
  // Generate all combinations
  for (const h of height) {
    for (const f of frame) {
      for (const m of modifiers) {
        builds.add(`${h} ${f}${m}`);
      }
    }
  }
  
  return Array.from(builds);
}

function generateFaces() {
  const faces = new Set();
  const { shape, condition, details } = components.face;
  
  for (const s of shape) {
    faces.add(s);
    for (const c of condition) {
      if (c) faces.add(`${s}, ${c}`);
      for (const d of details) {
        if (d) {
          faces.add(`${s} ${d}`);
          if (c) faces.add(`${s} ${d}, ${c}`);
        }
      }
    }
  }
  
  return Array.from(faces);
}

function generateHair() {
  const hair = new Set();
  const { length, texture, color, style, special } = components.hair;
  
  // Add special cases first
  special.forEach(s => hair.add(s));
  
  for (const l of length) {
    for (const t of texture) {
      hair.add(`${l}, ${t}`);
      for (const c of color) {
        if (c) {
          hair.add(`${l}, ${t} ${c}`);
          for (const s of style) {
            if (s) {
              hair.add(`${l}, ${t} ${s}`);
              hair.add(`${l}, ${t} ${c}, ${s}`);
            }
          }
        }
      }
    }
  }
  
  return Array.from(hair);
}

function generateEyes() {
  const eyes = new Set();
  const { color, condition, expression } = components.eyes;
  
  for (const c of color) {
    eyes.add(c);
    for (const cond of condition) {
      if (cond) eyes.add(`${c}, ${cond}`);
      for (const exp of expression) {
        if (exp) {
          eyes.add(`${c} with a ${exp}`);
          if (cond) eyes.add(`${c}, ${cond}, ${exp}`);
        }
      }
    }
  }
  
  return Array.from(eyes);
}

function generateDistinguishing() {
  const distinguishing = new Set();
  const { facial, body, movement, sensory, misc } = components.distinguishing;
  
  // Add all individual features
  [...facial, ...body, ...movement, ...sensory, ...misc].forEach(d => distinguishing.add(d));
  
  // Combine features from different categories
  for (const f of facial) {
    for (const s of sensory) {
      distinguishing.add(`${f}; ${s}`);
    }
  }
  
  for (const b of body) {
    for (const m of movement) {
      distinguishing.add(`${b}; ${m}`);
    }
  }
  
  for (const f of facial) {
    for (const m of misc) {
      distinguishing.add(`${f}; ${m}`);
    }
  }
  
  return Array.from(distinguishing);
}

// Generate data
console.log('Generating appearance data...');

const data = {
  name: "NPC Appearances",
  description: "Physical appearance descriptors for NPCs",
  build: generateBuilds(),
  face: generateFaces(),
  hair: generateHair(),
  eyes: generateEyes(),
  distinguishing: generateDistinguishing()
};

console.log(`Generated counts:
  - build: ${data.build.length}
  - face: ${data.face.length}
  - hair: ${data.hair.length}
  - eyes: ${data.eyes.length}
  - distinguishing: ${data.distinguishing.length}
  Total: ${data.build.length + data.face.length + data.hair.length + data.eyes.length + data.distinguishing.length}`);

// Write to file
fs.writeFileSync('data/npc/appearances.json', JSON.stringify(data, null, 2));
console.log('✓ Written to data/npc/appearances.json');
