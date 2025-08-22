// fix-featured-orderrank.js
// Run with: node fix-featured-orderrank.js

// Manual fix for featured mixtapes in order of publishedAt (most recent first)
const FEATURED_MIXTAPES_ORDER = [
  'inside-my-mind', // 2025-05-30 - should be first
  'madrugada', // 2025-05-27
  'forte-ilusao', // 2025-05-26
  'inner-belief', // Add based on your preferred order
  'mystical-planet',
  'take-me-to-new-york',
  'free-spirit',
  'morning-trip',
  'morning-song',
  'feel-the-spirit',
  'love-bombing-edit',
  'midnight-lady',
  'magic-fly',
  'unwinding',
  'cruzado',
  'fearless-warriors'
  // Add more featured mixtape IDs in your preferred order
];

function generateOrderRank(index) {
  return `0|${String(index * 1000).padStart(6, '0')}:`;
}

// Generate the mutations for Sanity Vision
console.log('Copy this array and paste it in Sanity Vision > Mutations tab:');
console.log();

const mutations = FEATURED_MIXTAPES_ORDER.map((id, index) => ({
  patch: {
    id: id,
    set: {
      orderRank: generateOrderRank(index)
    }
  }
}));

console.log(JSON.stringify(mutations, null, 2));

console.log();
console.log('This will set:');
FEATURED_MIXTAPES_ORDER.forEach((id, index) => {
  console.log(`${index + 1}. ${id} → ${generateOrderRank(index)}`);
});
