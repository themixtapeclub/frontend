// Create this file: scripts/analyze-modules.js
// Run with: node scripts/analyze-modules.js

const fs = require('fs');
const path = require('path');

// 1. Check your package.json dependencies
function analyzeDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Common heavy dependencies
    const heavyDeps = {
      react: 'React core',
      'react-dom': 'React DOM',
      next: 'Next.js framework',
      '@sanity/client': 'Sanity client',
      '@sanity/ui': 'Sanity UI components',
      sanity: 'Sanity studio',
      '@sanity/image-url': 'Sanity image handling',
      '@sanity/vision': 'Sanity query tool',
      '@radix-ui/react-dialog': 'Radix UI Dialog',
      '@radix-ui/react-dropdown-menu': 'Radix UI Dropdown',
      '@headlessui/react': 'Headless UI',
      '@heroicons/react': 'Hero Icons',
      'lucide-react': 'Lucide Icons',
      '@tabler/icons-react': 'Tabler Icons',
      tailwindcss: 'Tailwind CSS',
      'styled-components': 'Styled Components',
      '@emotion/react': 'Emotion CSS-in-JS',
      'react-hook-form': 'React Hook Form',
      '@hookform/resolvers': 'Form validation',
      zod: 'Schema validation',
      'framer-motion': 'Framer Motion animations',
      'lottie-react': 'Lottie animations',
      howler: 'Audio library',
      'react-player': 'Video/audio player',
      'wavesurfer.js': 'Audio waveforms',
      'date-fns': 'Date utilities',
      moment: 'Date library (HEAVY)',
      dayjs: 'Lightweight date library',
      zustand: 'State management',
      redux: 'Redux state',
      '@reduxjs/toolkit': 'Redux toolkit',
      axios: 'HTTP client',
      swr: 'Data fetching',
      typescript: 'TypeScript compiler',
      eslint: 'ESLint linter',
      '@types/node': 'Node.js types',
      '@types/react': 'React types'
    };

    Object.keys(deps).forEach((dep) => {
      if (heavyDeps[dep]) {
        // Heavy dependency found
      }
    });

    Object.keys(deps)
      .sort()
      .forEach((dep) => {
        // List all dependencies
      });
  } catch (error) {
    // Could not read package.json
  }
}

// 2. Analyze node_modules size
function analyzeNodeModules() {
  try {
    const nodeModulesPath = 'node_modules';
    if (!fs.existsSync(nodeModulesPath)) {
      return;
    }

    const packages = fs
      .readdirSync(nodeModulesPath)
      .filter((item) => !item.startsWith('.'))
      .map((packageName) => {
        const packagePath = path.join(nodeModulesPath, packageName);
        try {
          const stats = fs.statSync(packagePath);
          if (stats.isDirectory()) {
            const size = getDirSize(packagePath);
            return { name: packageName, size };
          }
        } catch (e) {
          return null;
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.size - a.size);

    packages.slice(0, 20).forEach((pkg, index) => {
      // Largest packages by size
    });

    const totalSize = packages.reduce((sum, pkg) => sum + pkg.size, 0);
    // Total node_modules size and number of packages
  } catch (error) {
    // Could not analyze node_modules
  }
}

// Helper function to get directory size
function getDirSize(dirPath) {
  let size = 0;
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        size += getDirSize(itemPath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }
  return size;
}

// 3. Check for common module duplication
function checkDuplicates() {
  const commonDuplicates = [
    'react',
    'react-dom',
    'typescript',
    '@types/react',
    'styled-components',
    'lodash',
    'moment',
    'axios'
  ];

  commonDuplicates.forEach((dep) => {
    try {
      const depPath = path.join('node_modules', dep);
      if (fs.existsSync(depPath)) {
        const nestedCopies = findNestedCopies('node_modules', dep);
        if (nestedCopies.length > 0) {
          // Duplicate found
        }
      }
    } catch (e) {
      // Skip
    }
  });
}

function findNestedCopies(dir, packageName, depth = 0) {
  const copies = [];
  if (depth > 3) return copies;

  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' && depth > 0) {
        const nestedPath = path.join(dir, item);
        const packagePath = path.join(nestedPath, packageName);
        if (fs.existsSync(packagePath)) {
          copies.push(packagePath);
        }
        copies.push(...findNestedCopies(nestedPath, packageName, depth + 1));
      } else if (item !== 'node_modules' && fs.statSync(path.join(dir, item)).isDirectory()) {
        copies.push(...findNestedCopies(path.join(dir, item), packageName, depth + 1));
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }

  return copies;
}

// 4. Check Next.js build output
function analyzeNextBuild() {
  const buildPath = '.next';
  if (!fs.existsSync(buildPath)) {
    return;
  }

  const chunksPath = path.join(buildPath, 'static', 'chunks');
  if (fs.existsSync(chunksPath)) {
    const chunks = fs
      .readdirSync(chunksPath)
      .filter((file) => file.endsWith('.js'))
      .map((file) => {
        const filePath = path.join(chunksPath, file);
        const stats = fs.statSync(filePath);
        return { name: file, size: stats.size };
      })
      .sort((a, b) => b.size - a.size);

    chunks.slice(0, 10).forEach((chunk, index) => {
      // Largest JavaScript chunks
    });

    const totalChunkSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    // Total chunk size and number of chunks
  }
}

// Run all analyses
analyzeDependencies();
analyzeNodeModules();
checkDuplicates();
analyzeNextBuild();
