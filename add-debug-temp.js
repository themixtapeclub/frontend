const fs = require('fs');
const file = 'lib/data/products/services/sanity-service.ts';
let content = fs.readFileSync(file, 'utf8');

// Add debug logging before the baseFilter line
const debugCode = `    console.log('🔍 FORMAT DEBUG:', {
      archiveType,
      slug,
      filterCondition: filterCondition.substring(0, 300)
    });`;

if (!content.includes('FORMAT DEBUG')) {
  content = content.replace(
    /const baseFilter = /,
    debugCode + '\n    const baseFilter = '
  );
  
  fs.writeFileSync(file, content);
  console.log('✅ Added debug logging back');
} else {
  console.log('Debug already exists');
}
