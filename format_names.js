const fs = require('fs');

function formatNamesFile(inputPath, outputPath) {
  console.log(`Formatting ${inputPath}...`);
  
  // Read and parse the file
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Create the formatted JSON string manually
  let formatted = '{\n';
  formatted += `  "name": "${data.name}",\n`;
  formatted += `  "description": "${data.description}",\n`;
  formatted += '  "entries": [\n';
  
  // Format each entry on a single line
  const entries = data.entries.map(entry => {
    return `    { "name": "${entry.name}", "race": ${JSON.stringify(entry.race)}${entry.gender ? `, "gender": ${JSON.stringify(entry.gender)}` : ''} }`;
  });
  
  formatted += entries.join(',\n');
  formatted += '\n  ]\n}';
  
  // Write the formatted file
  fs.writeFileSync(outputPath, formatted);
  console.log(`✓ Formatted ${data.entries.length} entries to ${outputPath}`);
}

// Format both files
formatNamesFile('data/npc/names-first.json', 'data/npc/names-first.json');
formatNamesFile('data/npc/names-last.json', 'data/npc/names-last.json');

console.log('\nFormatting complete! Both files now use the organized single-line format.');