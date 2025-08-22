// lib/utils/slug.ts

const URL_ENCODING_MAP: Record<string, string> = {
  // Basic characters
  '%20': ' ',
  '%21': '!',
  '%22': '"',
  '%23': '#',
  '%24': '$',
  '%25': '%',
  '%26': '&',
  '%27': "'",
  '%28': '(',
  '%29': ')',
  '%2A': '*',
  '%2B': '+',
  '%2C': ',',
  '%2D': '-',
  '%2E': '.',
  '%2F': '/',
  '%3A': ':',
  '%3B': ';',
  '%3C': '<',
  '%3D': '=',
  '%3E': '>',
  '%3F': '?',
  '%40': '@',
  '%5B': '[',
  '%5C': '\\',
  '%5D': ']',
  '%5E': '^',
  '%5F': '_',
  '%60': '`',
  '%7B': '{',
  '%7C': '|',
  '%7D': '}',
  '%7E': '~',

  // Extended characters
  '%C2%A0': ' ', // Non-breaking space
  '%E2%80%93': '–', // En dash
  '%E2%80%94': '—', // Em dash
  '%E2%80%99': "'", // Right single quotation mark
  '%E2%80%9C': '"', // Left double quotation mark
  '%E2%80%9D': '"' // Right double quotation mark
};

// Create variations for ASCII fallbacks (for matching)
const ASCII_FALLBACK_MAP: Record<string, string[]> = {
  à: ['a', 'À'],
  á: ['a', 'Á'],
  â: ['a', 'Â'],
  ã: ['a', 'Ã'],
  ä: ['a', 'Ä'],
  å: ['a', 'Å'],
  æ: ['ae', 'AE'],
  ç: ['c', 'Ç'],
  è: ['e', 'È'],
  é: ['e', 'É'],
  ê: ['e', 'Ê'],
  ë: ['e', 'Ë'],
  ì: ['i', 'Ì'],
  í: ['i', 'Í'],
  î: ['i', 'Î'],
  ï: ['i', 'Ï'],
  ñ: ['n', 'Ñ'],
  ò: ['o', 'Ò'],
  ó: ['o', 'Ó'],
  ô: ['o', 'Ô'],
  õ: ['o', 'Õ'],
  ö: ['o', 'Ö'],
  ø: ['o', 'Ø'],
  ù: ['u', 'Ù'],
  ú: ['u', 'Ú'],
  û: ['u', 'Û'],
  ü: ['u', 'Ü'],
  ý: ['y', 'Ý'],
  ÿ: ['y', 'Ÿ'],
  þ: ['th', 'Þ'],
  ð: ['d', 'Ð'],
  ß: ['ss', 'SS'],
  œ: ['oe', 'OE']
};

export function formatDisplayName(slug: string, type?: string): string {
  // Handle numeric formats (7, 12, etc.) by adding quotes to match Sanity data
  if (/^\d+$/.test(slug)) {
    return `${slug}"`;
  }

  // Handle uppercase formats that should stay uppercase
  const uppercaseFormats = ['lp', 'ep', 'cd', 'dvd', 'vhs'];
  if (uppercaseFormats.includes(slug.toLowerCase())) {
    return slug.toUpperCase();
  }

  // For labels, we need special handling to restore ampersands
  if (type === 'label') {
    // Split by hyphens and look for patterns that should become ampersands
    const words = slug.split('-');

    // If there are exactly 2 words, it might be "word1 & word2" pattern
    if (words.length === 2 && words[0] && words[1]) {
      const word1 = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
      const word2 = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
      return `${word1} & ${word2}`;
    }

    // Otherwise, fall back to checking for "and" replacement
    const formatted = words
      .map((word) => {
        const lowercaseWords = ['and', 'or', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with'];
        if (lowercaseWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');

    return formatted.replace(/\s+and\s+/gi, ' & ');
  }

  // For non-labels, use standard formatting
  const formatted = slug
    .split('-')
    .map((word) => {
      const lowercaseWords = ['and', 'or', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with'];
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return formatted;
}
// Alternative function specifically for labels that need & restoration
export function formatLabelDisplayName(slug: string, allLabels?: string[]): string {
  // If we have access to all labels from the database, try to find exact match
  if (allLabels && allLabels.length > 0) {
    const slugWords = slug.toLowerCase().replace(/-/g, ' ');

    // Look for exact match first
    const exactMatch = allLabels.find(
      (label) =>
        label
          .toLowerCase()
          .replace(/\s*&\s*/g, ' ')
          .trim() === slugWords
    );

    if (exactMatch) {
      return exactMatch;
    }
  }

  // Fallback to standard formatting with & restoration
  return formatDisplayName(slug, 'label');
}

// Keep the existing createSlug function (from the ProductCard component)
export function createSlug(text: string): string {
  let decodedText = text;

  // Only use DOM methods if we're in the browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    decodedText = tempDiv.textContent || tempDiv.innerText || text;
  } else {
    // Server-side: Handle common HTML entities manually
    decodedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  return (
    decodedText
      .toLowerCase()
      // Remove & and replace with space, then handle normally
      .replace(/\s*&\s*/g, ' ') // "Pinchy & Friends" becomes "pinchy  friends"
      .replace(/\s+/g, '-') // Replace spaces with hyphens: "pinchy-friends"
      .replace(/[^\w-]/g, '') // Remove non-word characters except hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-|-$/g, '')
  ); // Remove leading/trailing hyphens
}

export function generateSearchVariations(slug: string): string[] {
  const displayName = formatDisplayName(slug);
  const simpleName = slug.replace(/-/g, ' ');

  const variations: string[] = [
    displayName,
    displayName.toLowerCase(),
    displayName.toUpperCase(),
    simpleName,
    simpleName.toLowerCase(),
    simpleName.toUpperCase(),
    slug,
    slug.toLowerCase(),
    slug.toUpperCase(),
    // Add ampersand variations
    displayName.replace(/\s+/g, ' & '),
    displayName.replace(/\s+/g, ' & ').toLowerCase(),
    simpleName.replace(/\s+/g, ' & '),
    // Handle multiple consecutive words
    slug.replace(/-/g, ' & '),
    slug.replace(/-([a-z])/g, ' & $1')
  ];

  // Remove duplicates and empty strings
  return Array.from(new Set(variations)).filter(Boolean);
}

export function slugToDisplayName(slug: string): string {
  return slug
    .replace(/--/g, '-amp-')
    .split('-')
    .map((word) =>
      word.toLowerCase() === 'amp' ? '&' : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
    .trim();
}

/**
 * Normalize a string for comparison (removes accents, special chars, etc.)
 */
export function normalizeForComparison(input: string): string {
  if (!input) return '';

  let normalized = input.toLowerCase().trim();

  // Apply ASCII fallbacks
  Object.entries(ASCII_FALLBACK_MAP).forEach(([accented, fallbacks]) => {
    if (fallbacks && fallbacks[0]) {
      normalized = normalized.replace(new RegExp(accented, 'g'), fallbacks[0]);
    }
  });

  // Remove special characters except spaces and hyphens
  normalized = normalized.replace(/[^\w\s-]/g, '');

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}
