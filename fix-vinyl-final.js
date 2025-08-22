const fs = require('fs');
const file = 'lib/data/products/utils/filters.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace the format case with the exact format values from your data
const newFormatCase = `    case 'format':
      const formatName = slugToLabelName(slug);
      const upperSlug = slug.toUpperCase();
      const upperFormatName = formatName.toUpperCase();
      const titleCase = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
      const titleFormatName = formatName.charAt(0).toUpperCase() + formatName.slice(1).toLowerCase();
      
      // Special handling for vinyl formats based on actual data
      const vinylVariations = [];
      if (slug === '7' || slug === '7-inch' || formatName.includes('7')) {
        vinylVariations.push(
          'format[].main == "7\\""',
          '"7\\"" in format[].main'
        );
      }
      if (slug === '12' || slug === '12-inch' || formatName.includes('12')) {
        vinylVariations.push(
          'format[].main == "12\\""',
          '"12\\"" in format[].main'
        );
      }
      
      const standardConditions = [
        \`"\${upperSlug}" in format[].main\`,
        \`"\${upperFormatName}" in format[].main\`,
        \`"\${slug}" in format[].main\`,
        \`"\${formatName}" in format[].main\`,
        \`"\${slug.toLowerCase()}" in format[].main\`,
        \`"\${formatName.toLowerCase()}" in format[].main\`,
        \`"\${titleCase}" in format[].main\`,
        \`"\${titleFormatName}" in format[].main\`,
        \`format[].main == "\${upperSlug}"\`,
        \`format[].main == "\${upperFormatName}"\`,
        \`format[].main == "\${slug}"\`,
        \`format[].main == "\${formatName}"\`,
        \`format[].main == "\${titleCase}"\`,
        \`format[].main == "\${titleFormatName}"\`
      ];
      
      return [...standardConditions, ...vinylVariations].join(' || ');`;

// Replace the existing format case
content = content.replace(
  /case 'format':[\s\S]*?return \[[\s\S]*?\]\.join\(' \|\| '\);/,
  newFormatCase
);

fs.writeFileSync(file, content);
console.log('✅ Fixed vinyl format filter with correct escaping');
