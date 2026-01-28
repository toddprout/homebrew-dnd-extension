#!/usr/bin/env node

/**
 * JSON File Splitter for Large Files
 * 
 * This script scans a directory for JSON files larger than a specified size
 * and splits them into smaller chunks while maintaining valid JSON structure.
 * 
 * Usage:
 *   node split-large-json.js [directory] [maxSizeMB]
 * 
 * Examples:
 *   node split-large-json.js ./data/npc 24
 *   node split-large-json.js ./data 20
 *   node split-large-json.js  (defaults to current directory, 24MB max)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_MAX_SIZE_MB = 24; // Stay under 25MB GitHub limit
const BYTES_PER_MB = 1024 * 1024;

// Parse command line arguments
const targetDir = process.argv[2] || '.';
const maxSizeMB = parseFloat(process.argv[3]) || DEFAULT_MAX_SIZE_MB;
const maxSizeBytes = maxSizeMB * BYTES_PER_MB;

console.log('='.repeat(60));
console.log('JSON File Splitter');
console.log('='.repeat(60));
console.log(`Target directory: ${path.resolve(targetDir)}`);
console.log(`Max file size: ${maxSizeMB}MB`);
console.log('='.repeat(60));
console.log('');

/**
 * Get all JSON files in a directory (recursive)
 */
function getJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip output directories we create
      if (!file.match(/-split$/)) {
        getJsonFiles(filePath, fileList);
      }
    } else if (file.endsWith('.json')) {
      fileList.push({
        path: filePath,
        name: file,
        size: stat.size,
        sizeMB: (stat.size / BYTES_PER_MB).toFixed(2)
      });
    }
  }
  
  return fileList;
}

/**
 * Split a JSON file into smaller chunks
 */
function splitJsonFile(filePath, maxBytes) {
  const fileName = path.basename(filePath, '.json');
  const fileDir = path.dirname(filePath);
  const outputDir = path.join(fileDir, `${fileName}-split`);
  
  console.log(`\nProcessing: ${filePath}`);
  console.log(`Reading file...`);
  
  // Read and parse the JSON file
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    console.error(`  ERROR: Failed to parse JSON - ${error.message}`);
    return false;
  }
  
  // Determine the structure of the JSON
  let itemsArray = null;
  let wrapperKey = null;
  let metadata = {};
  
  if (Array.isArray(data)) {
    // Root is an array
    itemsArray = data;
  } else if (typeof data === 'object') {
    // Root is an object - find the array to split
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 100) {
        // This is likely the main data array
        if (!itemsArray || value.length > itemsArray.length) {
          wrapperKey = key;
          itemsArray = value;
        }
      } else {
        // Store as metadata
        metadata[key] = value;
      }
    }
    
    // If no large array found, check for common keys
    if (!itemsArray) {
      const commonKeys = ['entries', 'items', 'data', 'records', 'list', 'build', 'face', 'hair', 'eyes', 'distinguishing', 'positive', 'neutral', 'negative'];
      for (const key of commonKeys) {
        if (data[key] && Array.isArray(data[key])) {
          wrapperKey = key;
          itemsArray = data[key];
          break;
        }
      }
    }
    
    // Handle case where object has multiple arrays (like appearances.json)
    if (!itemsArray) {
      // Check if all values are arrays - if so, split the whole object differently
      const arrayKeys = Object.entries(data).filter(([k, v]) => Array.isArray(v));
      if (arrayKeys.length > 1) {
        console.log(`  Found ${arrayKeys.length} arrays in object, will split each array's contents`);
        return splitMultiArrayJson(filePath, data, maxBytes, outputDir);
      }
    }
  }
  
  if (!itemsArray || itemsArray.length === 0) {
    console.log(`  SKIP: Could not find array data to split`);
    return false;
  }
  
  console.log(`  Found ${itemsArray.length} items in "${wrapperKey || 'root array'}"`);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Calculate approximate items per chunk
  const totalSize = fs.statSync(filePath).size;
  const avgItemSize = totalSize / itemsArray.length;
  const targetItemsPerChunk = Math.floor((maxBytes * 0.9) / avgItemSize); // 90% to be safe
  const itemsPerChunk = Math.max(100, Math.min(targetItemsPerChunk, itemsArray.length));
  
  console.log(`  Splitting into chunks of ~${itemsPerChunk} items each`);
  
  // Split into chunks
  const chunks = [];
  for (let i = 0; i < itemsArray.length; i += itemsPerChunk) {
    chunks.push(itemsArray.slice(i, i + itemsPerChunk));
  }
  
  console.log(`  Creating ${chunks.length} chunk files...`);
  
  // Write chunk files
  const chunkFiles = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkFileName = `${fileName}-${String(i + 1).padStart(3, '0')}.json`;
    const chunkPath = path.join(outputDir, chunkFileName);
    
    let chunkData;
    if (wrapperKey) {
      // Wrap array back in object with metadata
      chunkData = { ...metadata };
      chunkData[wrapperKey] = chunks[i];
      chunkData._chunk = {
        index: i + 1,
        total: chunks.length,
        originalFile: fileName + '.json'
      };
    } else {
      // Root array
      chunkData = chunks[i];
    }
    
    const chunkJson = JSON.stringify(chunkData, null, 2);
    fs.writeFileSync(chunkPath, chunkJson);
    
    const chunkSize = fs.statSync(chunkPath).size;
    chunkFiles.push({
      name: chunkFileName,
      size: chunkSize,
      sizeMB: (chunkSize / BYTES_PER_MB).toFixed(2),
      itemCount: chunks[i].length
    });
    
    // Check if chunk is still too big
    if (chunkSize > maxBytes) {
      console.log(`  WARNING: ${chunkFileName} is ${(chunkSize / BYTES_PER_MB).toFixed(2)}MB - may need smaller chunks`);
    }
  }
  
  // Create manifest file
  const manifest = {
    originalFile: fileName + '.json',
    splitDate: new Date().toISOString(),
    totalItems: itemsArray.length,
    totalChunks: chunks.length,
    wrapperKey: wrapperKey,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    chunks: chunkFiles.map(c => c.name)
  };
  
  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Summary
  console.log(`  ✓ Created ${chunks.length} chunks in: ${outputDir}`);
  chunkFiles.forEach(c => {
    console.log(`    - ${c.name}: ${c.sizeMB}MB (${c.itemCount} items)`);
  });
  
  return true;
}

/**
 * Handle JSON files with multiple arrays (like appearances.json with build, face, hair, etc.)
 */
function splitMultiArrayJson(filePath, data, maxBytes, outputDir) {
  const fileName = path.basename(filePath, '.json');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all arrays and their sizes
  const arrays = {};
  const metadata = {};
  let totalItems = 0;
  
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      arrays[key] = value;
      totalItems += value.length;
    } else {
      metadata[key] = value;
    }
  }
  
  console.log(`  Total items across all arrays: ${totalItems}`);
  
  // Calculate how to distribute
  const totalSize = fs.statSync(filePath).size;
  const avgItemSize = totalSize / totalItems;
  const targetItemsPerChunk = Math.floor((maxBytes * 0.85) / avgItemSize);
  
  console.log(`  Target items per chunk: ~${targetItemsPerChunk}`);
  
  // Build chunks by combining arrays until we hit the limit
  const chunks = [];
  let currentChunk = { ...metadata };
  let currentChunkItems = 0;
  
  for (const [key, items] of Object.entries(arrays)) {
    // If this array alone is bigger than chunk size, split it
    if (items.length > targetItemsPerChunk) {
      // Save current chunk if it has data
      if (currentChunkItems > 0) {
        chunks.push(currentChunk);
        currentChunk = { ...metadata };
        currentChunkItems = 0;
      }
      
      // Split this large array
      for (let i = 0; i < items.length; i += targetItemsPerChunk) {
        const splitChunk = { ...metadata };
        splitChunk[key] = items.slice(i, i + targetItemsPerChunk);
        splitChunk._arrayKey = key;
        splitChunk._arrayPart = Math.floor(i / targetItemsPerChunk) + 1;
        chunks.push(splitChunk);
      }
    } else if (currentChunkItems + items.length > targetItemsPerChunk) {
      // This array would make chunk too big, start new chunk
      chunks.push(currentChunk);
      currentChunk = { ...metadata };
      currentChunk[key] = items;
      currentChunkItems = items.length;
    } else {
      // Add to current chunk
      currentChunk[key] = items;
      currentChunkItems += items.length;
    }
  }
  
  // Don't forget last chunk
  if (currentChunkItems > 0) {
    chunks.push(currentChunk);
  }
  
  console.log(`  Creating ${chunks.length} chunk files...`);
  
  // Write chunk files
  const chunkFiles = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkFileName = `${fileName}-${String(i + 1).padStart(3, '0')}.json`;
    const chunkPath = path.join(outputDir, chunkFileName);
    
    chunks[i]._chunk = {
      index: i + 1,
      total: chunks.length,
      originalFile: fileName + '.json'
    };
    
    const chunkJson = JSON.stringify(chunks[i], null, 2);
    fs.writeFileSync(chunkPath, chunkJson);
    
    const chunkSize = fs.statSync(chunkPath).size;
    const arrayKeys = Object.keys(chunks[i]).filter(k => Array.isArray(chunks[i][k]));
    
    chunkFiles.push({
      name: chunkFileName,
      size: chunkSize,
      sizeMB: (chunkSize / BYTES_PER_MB).toFixed(2),
      contains: arrayKeys
    });
    
    if (chunkSize > maxBytes) {
      console.log(`  WARNING: ${chunkFileName} is ${(chunkSize / BYTES_PER_MB).toFixed(2)}MB - may need smaller chunks`);
    }
  }
  
  // Create manifest file
  const manifest = {
    originalFile: fileName + '.json',
    splitDate: new Date().toISOString(),
    structure: 'multi-array',
    arrayKeys: Object.keys(arrays),
    totalChunks: chunks.length,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    chunks: chunkFiles.map(c => ({ name: c.name, contains: c.contains }))
  };
  
  fs.writeFileSync(
    path.join(outputDir, '_manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Summary
  console.log(`  ✓ Created ${chunks.length} chunks in: ${outputDir}`);
  chunkFiles.forEach(c => {
    console.log(`    - ${c.name}: ${c.sizeMB}MB (contains: ${c.contains.join(', ')})`);
  });
  
  return true;
}

// Main execution
function main() {
  // Check if directory exists
  if (!fs.existsSync(targetDir)) {
    console.error(`ERROR: Directory not found: ${targetDir}`);
    process.exit(1);
  }
  
  // Find all JSON files
  console.log('Scanning for JSON files...\n');
  const jsonFiles = getJsonFiles(targetDir);
  
  if (jsonFiles.length === 0) {
    console.log('No JSON files found.');
    process.exit(0);
  }
  
  // Find large files
  const largeFiles = jsonFiles.filter(f => f.size > maxSizeBytes);
  const smallFiles = jsonFiles.filter(f => f.size <= maxSizeBytes);
  
  console.log(`Found ${jsonFiles.length} JSON files:`);
  console.log(`  - ${smallFiles.length} files under ${maxSizeMB}MB (OK)`);
  console.log(`  - ${largeFiles.length} files over ${maxSizeMB}MB (need splitting)`);
  
  if (largeFiles.length === 0) {
    console.log('\n✓ All files are within size limit. Nothing to do!');
    process.exit(0);
  }
  
  console.log('\nLarge files to split:');
  largeFiles.forEach(f => {
    console.log(`  - ${f.path} (${f.sizeMB}MB)`);
  });
  
  // Process each large file
  console.log('\n' + '='.repeat(60));
  console.log('Splitting large files...');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of largeFiles) {
    const success = splitJsonFile(file.path, maxSizeBytes);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Successfully split: ${successCount} files`);
  if (failCount > 0) {
    console.log(`Failed/skipped: ${failCount} files`);
  }
  console.log('\nNext steps:');
  console.log('1. Upload the *-split folders to GitHub (instead of the original large files)');
  console.log('2. Delete or keep the original large files locally as backup');
  console.log('3. The _manifest.json in each folder lists all the chunks');
}

main();