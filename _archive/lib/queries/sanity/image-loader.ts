// lib/sanity/image-loader.js
// Custom image loader for Sanity images

export default function sanityImageLoader({ src, width, quality }) {
  // Only handle Sanity images
  if (!src.includes('sanity.io')) {
    return src;
  }

  const url = new URL(src);

  // Set optimization parameters
  url.searchParams.set('w', width.toString());
  url.searchParams.set('h', width.toString()); // Keep square for product cards
  url.searchParams.set('fit', 'fill');
  url.searchParams.set('auto', 'format');

  if (quality) {
    url.searchParams.set('q', quality.toString());
  }

  return url.toString();
}
