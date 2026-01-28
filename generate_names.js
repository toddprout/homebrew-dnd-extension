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
    male: { prefixes: ['Al', 'The', 'Gar', 'Bry', 'Cad', 'Dar', 'Eam', 'Fin', 'Gal', 'Hec', 'Ia', 'Jar', 'Kae', 'Lor', 'Mad', 'Nol', 'Owe', 'Per', 'Qui', 'Ryl'], suffixes: ['ric', 'ron', 'rett', 'n', 'en', 'ian', 'on', 'n', 'en', 'tor', 'n', 'eth', 'l', 'in', 'ox', 'an', 'n', 'rin', 'nn', 'an'] },
    female: { prefixes: ['Ele', 'Mir', 'Cor', 'Lys', 'Sar', 'An', 'Bri', 'Cal', 'Del', 'Eri', 'Fay', 'Gia', 'Hel', 'Ivy', 'Joy', 'Kyr', 'Lil', 'May', 'Nia', 'Oli'], suffixes: ['na', 'a', 'a', 'a', 'ah', 'na', 'anna', 'ista', 'ia', 'ka', 'ra', 'sa', 'ta', 'va', 'na', 'a', 'a', 'a', 'a', 'a'] },
    neutral: { prefixes: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Jamie', 'Avery', 'Skyler', 'Reese', 'Dakota', 'Sage', 'Rowan', 'Blair', 'Cameron', 'Drew', 'Ellis', 'Finley', 'Gray', 'Hayden'], suffixes: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] }
  },
  elf: {
    male: { prefixes: ['Thar', 'Ael', 'Syl', 'Vae', 'Cae', 'Ely', 'Fae', 'Gal', 'Hal', 'Ith', 'Jor', 'Kae', 'Lot', 'Mae', 'Nim', 'Oph', 'Phae', 'Que', 'Riv', 'Sae'], suffixes: ['indol', 'indra', 'varis', 'ril', 'lynn', 'ndor', 'lar', 'ion', 'dir', 'il', 'und', 'lthas', 'har', 'lor', 'loth', 'orin', 'lor', 'lar', 'en', 'lor'] },
    female: { prefixes: ['Ael', 'Syl', 'Cae', 'Ely', 'Fae', 'Gal', 'Hal', 'Ith', 'Jor', 'Kae', 'Lot', 'Mae', 'Nim', 'Oph', 'Phae', 'Que', 'Riv', 'Sae', 'Tae', 'Uae'], suffixes: ['indra', 'varis', 'lynn', 'ndra', 'lara', 'ion', 'dir', 'il', 'und', 'lthas', 'har', 'lor', 'loth', 'orin', 'lor', 'lar', 'en', 'lor', 'riel', 'riel'] },
    neutral: { prefixes: ['Syl', 'Vae', 'Cae', 'Ely', 'Fae', 'Gal', 'Hal', 'Ith', 'Jor', 'Kae', 'Lot', 'Mae', 'Nim', 'Oph', 'Phae', 'Que', 'Riv', 'Sae', 'Tae', 'Uae'], suffixes: ['varis', 'ril', 'lynn', 'ndor', 'lar', 'ion', 'dir', 'il', 'und', 'lthas', 'har', 'lor', 'loth', 'orin', 'lor', 'lar', 'en', 'lor', 'riel', 'riel'] }
  },
  dwarf: {
    male: { prefixes: ['Dol', 'Hel', 'Thor', 'Bru', 'Dur', 'Gim', 'Har', 'Ild', 'Jor', 'Krag', 'Loth', 'Mor', 'Nor', 'Orik', 'Pyr', 'Quar', 'Rur', 'Snor', 'Thrain', 'Ulf'], suffixes: ['grim', 'ga', 'adin', 'hild', 'ik', 'li', 'ald', 'ur', 'und', 'ak', 'gar', 'in', 'rik', 'ak', 'in', 'ak', 'ik', 'ri', 'in', 'ar'] },
    female: { prefixes: ['Hel', 'Bru', 'Dur', 'Gim', 'Har', 'Ild', 'Jor', 'Krag', 'Loth', 'Mor', 'Nor', 'Orik', 'Pyr', 'Quar', 'Rur', 'Snor', 'Thrain', 'Ulf', 'Vera', 'Wynn'], suffixes: ['ga', 'hild', 'ik', 'li', 'ald', 'ur', 'und', 'ak', 'gar', 'in', 'rik', 'ak', 'in', 'ak', 'ik', 'ri', 'in', 'ar', 'a', 'a'] },
    neutral: { prefixes: ['Dur', 'Gim', 'Har', 'Ild', 'Jor', 'Krag', 'Loth', 'Mor', 'Nor', 'Orik', 'Pyr', 'Quar', 'Rur', 'Snor', 'Thrain', 'Ulf', 'Vera', 'Wynn', 'Xar', 'Yor'], suffixes: ['ik', 'li', 'ald', 'ur', 'und', 'ak', 'gar', 'in', 'rik', 'ak', 'in', 'ak', 'ik', 'ri', 'in', 'ar', 'a', 'a', 'k', 'k'] }
  },
  halfling: {
    male: { prefixes: ['Pip', 'Mil', 'Bil', 'Gil', 'Hob', 'Kit', 'Lil', 'Mim', 'Nin', 'Odi', 'Pop', 'Que', 'Ril', 'Sil', 'Til', 'Vil', 'Wil', 'Xil', 'Yil', 'Zil'], suffixes: ['pin', 'o', 'bo', 'bert', 'son', 'ty', 'y', 'sy', 'a', 'e', 'py', 'en', 'ly', 'ly', 'ly', 'ly', 'ly', 'ly', 'ly', 'ly'] },
    female: { prefixes: ['Ros', 'Cor', 'Daf', 'El', 'Fro', 'Ivy', 'Jil', 'Lil', 'Mim', 'Nin', 'Odi', 'Pop', 'Que', 'Ril', 'Sil', 'Til', 'Vil', 'Wil', 'Xil', 'Yil'], suffixes: ['ie', 'a', 'odil', 'anor', 'do', 'a', 'ly', 'y', 'sy', 'a', 'e', 'py', 'en', 'ly', 'ly', 'ly', 'ly', 'ly', 'ly', 'ly'] },
    neutral: { prefixes: ['Fin', 'Bil', 'Daf', 'El', 'Fro', 'Gil', 'Hob', 'Ivy', 'Jil', 'Kit', 'Lil', 'Mim', 'Nin', 'Odi', 'Pop', 'Que', 'Ril', 'Sil', 'Til', 'Vil'], suffixes: ['ley', 'bo', 'odil', 'anor', 'do', 'bert', 'son', 'a', 'ly', 'ty', 'y', 'sy', 'a', 'e', 'py', 'en', 'ly', 'ly', 'ly', 'ly'] }
  },
  'half-elf': {
    male: { prefixes: ['Al', 'The', 'Gar', 'Bry', 'Cad', 'Dar', 'Eam', 'Fin', 'Gal', 'Hec', 'Ia', 'Jar', 'Kae', 'Lor', 'Mad', 'Nol', 'Owe', 'Per', 'Qui', 'Ryl'], suffixes: ['ric', 'ron', 'rett', 'n', 'en', 'ian', 'on', 'n', 'en', 'tor', 'n', 'eth', 'l', 'in', 'ox', 'an', 'n', 'rin', 'nn', 'an'] },
    female: { prefixes: ['Ele', 'Mir', 'Cor', 'Lys', 'Sar', 'An', 'Bri', 'Cal', 'Del', 'Eri', 'Fay', 'Gia', 'Hel', 'Ivy', 'Joy', 'Kyr', 'Lil', 'May', 'Nia', 'Oli'], suffixes: ['na', 'a', 'a', 'a', 'ah', 'na', 'anna', 'ista', 'ia', 'ka', 'ra', 'sa', 'ta', 'va', 'na', 'a', 'a', 'a', 'a', 'a'] },
    neutral: { prefixes: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Jamie', 'Avery', 'Skyler', 'Reese', 'Dakota', 'Sage', 'Rowan', 'Blair', 'Cameron', 'Drew', 'Ellis', 'Finley', 'Gray', 'Hayden'], suffixes: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] }
  },
  'half-orc': {
    male: { prefixes: ['Kru', 'Sha', 'Gro', 'Yas', 'Tho', 'Kra', 'Mog', 'Rag', 'Ska', 'Ulg', 'Vog', 'Wog', 'Xog', 'Yog', 'Zog', 'Ar', 'Br', 'Cr', 'Dr', 'Er'], suffixes: ['sk', 'ra', 'k', 'ha', 'kk', 'sh', 'g', 'n', 'r', 'k', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'] },
    female: { prefixes: ['Sha', 'Yas', 'Gro', 'Kra', 'Mog', 'Rag', 'Ska', 'Ulg', 'Vog', 'Wog', 'Xog', 'Yog', 'Zog', 'Ar', 'Br', 'Cr', 'Dr', 'Er', 'Fr', 'Gr'], suffixes: ['ra', 'ha', 'k', 'sh', 'g', 'n', 'r', 'k', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'a', 'a'] },
    neutral: { prefixes: ['Gro', 'Kra', 'Mog', 'Rag', 'Ska', 'Ulg', 'Vog', 'Wog', 'Xog', 'Yog', 'Zog', 'Ar', 'Br', 'Cr', 'Dr', 'Er', 'Fr', 'Gr', 'Hr', 'Ir'], suffixes: ['k', 'sh', 'g', 'n', 'r', 'k', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'k', 'k', 'k', 'k'] }
  },
  tiefling: {
    male: { prefixes: ['Zep', 'Mor', 'Rie', 'Dam', 'Kal', 'Ak', 'Bel', 'Cor', 'Dre', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra', 'Lor', 'Mor', 'Nor', 'Oph'], suffixes: ['hyr', 'thos', 'ta', 'akos', 'lista', 'men', 'phe', 'rax', 'tor', 'var', 'xen', 'yor', 'zar', 'ath', 'eth', 'ith', 'oth', 'uth', 'yth', 'ath'] },
    female: { prefixes: ['Mor', 'Rie', 'Dam', 'Kal', 'Ak', 'Bel', 'Cor', 'Dre', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra', 'Lor', 'Mor', 'Nor', 'Oph', 'Phe'], suffixes: ['thos', 'ta', 'akos', 'lista', 'men', 'phe', 'rax', 'tor', 'var', 'xen', 'yor', 'zar', 'ath', 'eth', 'ith', 'oth', 'uth', 'yth', 'ath', 'ira'] },
    neutral: { prefixes: ['Zep', 'Mor', 'Rie', 'Dam', 'Kal', 'Ak', 'Bel', 'Cor', 'Dre', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra', 'Lor', 'Mor', 'Nor', 'Oph'], suffixes: ['hyr', 'thos', 'ta', 'akos', 'lista', 'men', 'phe', 'rax', 'tor', 'var', 'xen', 'yor', 'zar', 'ath', 'eth', 'ith', 'oth', 'uth', 'yth', 'ath'] }
  },
  gnome: {
    male: { prefixes: ['Gno', 'Til', 'Fiz', 'Nyx', 'Wob', 'Zig', 'Bub', 'Cog', 'Dab', 'Eek', 'Fip', 'Gad', 'Hap', 'Ink', 'Jib', 'Kip', 'Lug', 'Mug', 'Nip', 'Oop'], suffixes: ['rbitt', 'ly', 'zwick', 'x', 'bles', 'gy', 'ble', 'wheel', 'ble', 'e', 'ple', 'get', 'py', 'well', 'ber', 'per', 'nut', 'wort', 'ple', 's'] },
    female: { prefixes: ['Til', 'Fiz', 'Nyx', 'Wob', 'Zig', 'Bub', 'Cog', 'Dab', 'Eek', 'Fip', 'Gad', 'Hap', 'Ink', 'Jib', 'Kip', 'Lug', 'Mug', 'Nip', 'Oop', 'Pip'], suffixes: ['ly', 'zwick', 'x', 'bles', 'gy', 'ble', 'wheel', 'ble', 'e', 'ple', 'get', 'py', 'well', 'ber', 'per', 'nut', 'wort', 'ple', 's', 's'] },
    neutral: { prefixes: ['Wob', 'Zig', 'Bub', 'Cog', 'Dab', 'Eek', 'Fip', 'Gad', 'Hap', 'Ink', 'Jib', 'Kip', 'Lug', 'Mug', 'Nip', 'Oop', 'Pip', 'Quip', 'Rip', 'Sip'], suffixes: ['bles', 'gy', 'ble', 'wheel', 'ble', 'e', 'ple', 'get', 'py', 'well', 'ber', 'per', 'nut', 'wort', 'ple', 's', 's', 's', 's', 's'] }
  },
  dragonborn: {
    male: { prefixes: ['Drax', 'Mish', 'Kriv', 'Ak', 'Bhar', 'Sora', 'Tiam', 'Vara', 'Zhar', 'Arj', 'Bel', 'Cor', 'Durn', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra'], suffixes: ['x', 'ann', 'iv', 'ra', 'ash', 'a', 'at', 'a', 'ak', 'han', 'ak', 'ax', 'n', 'ar', 'en', 'ath', 'tor', 'ar', 'ath', 'sh'] },
    female: { prefixes: ['Mish', 'Ak', 'Bhar', 'Sora', 'Tiam', 'Vara', 'Zhar', 'Arj', 'Bel', 'Cor', 'Durn', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra', 'Lor', 'Mor'], suffixes: ['ann', 'ra', 'ash', 'a', 'at', 'a', 'ak', 'han', 'ak', 'ax', 'n', 'ar', 'en', 'ath', 'tor', 'ar', 'ath', 'sh', 'a', 'a'] },
    neutral: { prefixes: ['Kriv', 'Ak', 'Bhar', 'Sora', 'Tiam', 'Vara', 'Zhar', 'Arj', 'Bel', 'Cor', 'Durn', 'Eld', 'Fyr', 'Gor', 'Hek', 'Ild', 'Jor', 'Kra', 'Lor', 'Mor'], suffixes: ['iv', 'ra', 'ash', 'a', 'at', 'a', 'ak', 'han', 'ak', 'ax', 'n', 'ar', 'en', 'ath', 'tor', 'ar', 'ath', 'sh', 'k', 'k'] }
  },
  aarakocra: {
    male: { prefixes: ['Aer', 'Alo', 'Ari', 'Avi', 'Cyr', 'Ely', 'Fae', 'Gla', 'Hae', 'Iri', 'Jae', 'Kae', 'Lyr', 'Myr', 'Nae', 'Ory', 'Pae', 'Qua', 'Rya', 'Sae'], suffixes: ['on', 'ft', 'el', 'an', 'us', 'ria', 'ther', 'den', 'lia', 's', 'lor', 'ris', 'ion', 'ath', 'tor', 'el', 'ther', 'us', 'an', 'ria'] },
    female: { prefixes: ['Aer', 'Alo', 'Ari', 'Avi', 'Cyr', 'Ely', 'Fae', 'Gla', 'Hae', 'Iri', 'Jae', 'Kae', 'Lyr', 'Myr', 'Nae', 'Ory', 'Pae', 'Qua', 'Rya', 'Sae'], suffixes: ['on', 'ft', 'el', 'an', 'us', 'ria', 'ther', 'den', 'lia', 's', 'lor', 'ris', 'ion', 'ath', 'tor', 'el', 'ther', 'us', 'an', 'ria'] },
    neutral: { prefixes: ['Aer', 'Alo', 'Ari', 'Avi', 'Cyr', 'Ely', 'Fae', 'Gla', 'Hae', 'Iri', 'Jae', 'Kae', 'Lyr', 'Myr', 'Nae', 'Ory', 'Pae', 'Qua', 'Rya', 'Sae'], suffixes: ['on', 'ft', 'el', 'an', 'us', 'ria', 'ther', 'den', 'lia', 's', 'lor', 'ris', 'ion', 'ath', 'tor', 'el', 'ther', 'us', 'an', 'ria'] }
  },
  genasi: {
    male: { prefixes: ['Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter'], suffixes: ['is', 'is', 'is', 'is', 'on', 'on', 'on', 'on', 'us', 'us', 'us', 'us', 'ar', 'ar', 'ar', 'ar', 'el', 'el', 'el', 'el'] },
    female: { prefixes: ['Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter'], suffixes: ['a', 'a', 'a', 'a', 'ia', 'ia', 'ia', 'ia', 'ra', 'ra', 'ra', 'ra', 'la', 'la', 'la', 'la', 'na', 'na', 'na', 'na'] },
    neutral: { prefixes: ['Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter', 'Aer', 'Aqu', 'Ign', 'Ter'], suffixes: ['is', 'is', 'is', 'is', 'on', 'on', 'on', 'on', 'us', 'us', 'us', 'us', 'ar', 'ar', 'ar', 'ar', 'el', 'el', 'el', 'el'] }
  },
  goliath: {
    male: { prefixes: ['Ga', 'Ke', 'La', 'Mu', 'No', 'Po', 'Qu', 'Ra', 'Sa', 'Ta', 'Va', 'Wa', 'Xa', 'Ya', 'Za', 'Ba', 'Ca', 'Da', 'Ea', 'Fa'], suffixes: ['van', 'ren', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor'] },
    female: { prefixes: ['Ga', 'Ke', 'La', 'Mu', 'No', 'Po', 'Qu', 'Ra', 'Sa', 'Ta', 'Va', 'Wa', 'Xa', 'Ya', 'Za', 'Ba', 'Ca', 'Da', 'Ea', 'Fa'], suffixes: ['van', 'ren', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor'] },
    neutral: { prefixes: ['Ga', 'Ke', 'La', 'Mu', 'No', 'Po', 'Qu', 'Ra', 'Sa', 'Ta', 'Va', 'Wa', 'Xa', 'Ya', 'Za', 'Ba', 'Ca', 'Da', 'Ea', 'Fa'], suffixes: ['van', 'ren', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor', 'rik', 'van', 'rok', 'thak', 'nor'] }
  }
};

const entries = [];

for (const race in races) {
  const genders = ['male', 'female', 'neutral'];
  for (const gender of genders) {
    console.log(`\nProcessing ${race} ${gender}...`);
    const { prefixes, suffixes } = races[race][gender];
    const names = generateAllPossibleNames(prefixes, suffixes); // Generate ALL possible combinations
    names.forEach(name => entries.push({ name, race: [race], gender: [gender] }));
    console.log(`Added ${names.length} names for ${race} ${gender}`);
  }
}

const json = {
  name: "NPC First Names",
  description: "First names tagged by race and gender for NPC generation",
  entries
};

fs.writeFileSync('data/npc/names-first.json', JSON.stringify(json, null, 2));
console.log(`\nGenerated ${entries.length} total first names!`);