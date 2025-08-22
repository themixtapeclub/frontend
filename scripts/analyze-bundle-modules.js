// scripts/analyze-bundle-modules.js
const fs = require('fs');
const path = require('path');

console.log('🔍 ANALYZING BUNDLE MODULES...\n');

// Read the build output to find large modules
const buildDir = '.next';

function analyzeChunks() {
  const chunksDir = path.join(buildDir, 'static', 'chunks');

  if (!fs.existsSync(chunksDir)) {
    console.log('❌ No chunks directory found. Run a build first.');
    return;
  }

  const chunks = fs
    .readdirSync(chunksDir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
      const filePath = path.join(chunksDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      };
    })
    .sort((a, b) => b.size - a.size);

  console.log('📦 LARGEST CHUNKS:');
  chunks.slice(0, 10).forEach((chunk, i) => {
    console.log(`${i + 1}. ${chunk.name} - ${chunk.sizeKB} KB`);
  });

  return chunks;
}

function analyzeDependencies() {
  console.log('\n📋 ANALYZING PACKAGE.JSON DEPENDENCIES...\n');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // Estimate which deps might be heavy
  const heavyDeps = [
    '@sanity/client',
    '@sanity/image-url',
    'next',
    'react',
    'react-dom',
    'graphql-request',
    '@graphql-codegen/cli',
    'swiper',
    'tailwindcss'
  ];

  console.log('🎯 POTENTIALLY HEAVY DEPENDENCIES:');
  heavyDeps.forEach((dep) => {
    if (deps[dep]) {
      console.log(`   ✓ ${dep}: ${deps[dep]}`);
    }
  });

  console.log('\n📊 TOTAL DEPENDENCIES:', Object.keys(deps).length);
}

function checkNodeModulesSize() {
  console.log('\n📁 NODE_MODULES SIZE ANALYSIS...\n');

  const nodeModulesPath = 'node_modules';
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ No node_modules found');
    return;
  }

  // This is a simplified check - for detailed analysis use du command
  try {
    const dirs = fs
      .readdirSync(nodeModulesPath)
      .filter((dir) => !dir.startsWith('.'))
      .slice(0, 20); // Just show first 20

    console.log('🔍 FIRST 20 NODE_MODULES DIRECTORIES:');
    dirs.forEach((dir) => console.log(`   - ${dir}`));
    console.log(`   ... and more (total directories)`);
  } catch (error) {
    console.log('❌ Error reading node_modules:', error.message);
  }
}

// Run the analysis
analyzeChunks();
analyzeDependencies();
checkNodeModulesSize();

console.log('\n🔍 FOR DETAILED MODULE ANALYSIS:');
console.log('1. Use bundle analyzer: open .next/analyze/client.html');
console.log('2. Check specific chunks in .next/static/chunks/');
console.log('3. Run: du -sh node_modules/* | sort -hr | head -20');
console.log('4. Search in bundle analyzer for specific module names');
