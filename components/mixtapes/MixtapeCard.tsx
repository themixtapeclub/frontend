// components/mixtapes/MixtapeCard.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Contributor {
  _id: string;
  name: string;
  slug?: {
    current: string;
  };
  image?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
  featured?: boolean;
  archived?: boolean;
  location?: string;
}

interface Product {
  _id: string;
  title: string;
  sku?: string;
  swellSlug?: string;
  swellProductId?: string;
  price?: number;
  artist?: string[];
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
  };
}

interface Mixtape {
  _id: string;
  title: string;
  slug: string | { current: string };
  artist?: string;

  // NEW: Multiple contributors structure
  contributors?: Contributor[];
  contributorNames?: string;
  _contributorNames?: string;

  featuredImage?: {
    asset: {
      _id: string;
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
    crop?: any;
    hotspot?: any;
  };
  genre?: string;
  featured?: boolean;
  description?: string;
  duration?: string;
  releaseDate?: string;
  mixcloudUrl?: string;
  tracklist?: Array<{
    _key: string;
    _type?: string;
    artist: string;
    trackTitle?: string;
    title?: string;
    product?: {
      _ref: string;
      _type: string;
    };
  }>;
  tags?: string[];
}

interface MixtapeCardProps {
  mixtape: Mixtape;
  variant?: 'regular' | 'featured';
  priority?: boolean;
  index?: number;
  context?: 'default' | 'related' | 'inMixtapes';
  isFeatured?: boolean;
  products?: Product[];
}

// Priority tags that should not be linked (matching SimpleRelatedMixtapes.jsx)
const PRIORITY_TAGS = ['dance', 'groovy', 'listening', 'healing', 'global', 'chill', 'nostalgia'];

// Enhanced image optimization function with smart aspect ratio handling
function optimizeImageUrl(url: string, title: string): string {
  if (!url) {
    return '/placeholder.jpg';
  }

  if (url.includes('sanity')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=800&h=800&fit=fill&bg=000000&auto=format&q=85`;
  }

  if (url.includes('w=400')) {
    return url
      .replace(/w=\d+&h=\d+/, 'w=800&h=800')
      .replace(/fit=\w+/, 'fit=fill')
      .replace(/crop=\w+/, '');
  }

  return url;
}

// Preload critical images immediately
function preloadImage(src: string): void {
  // More comprehensive SSR safety check
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Additional safety check
  if (!document.head) {
    return;
  }

  try {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.type = 'image/jpeg';
    document.head.appendChild(link);
  } catch (error) {
    // Silently fail if there's any issue during preloading
    console.warn('Failed to preload image:', error);
  }
}

// Format artists list exactly like WordPress: "Artist1, Artist2 & Artist3"
function formatArtistsList(artists: (string | undefined)[]): string {
  if (artists.length === 0) return '';

  const uniqueArtists = Array.from(
    new Set(
      artists
        .filter((artist): artist is string => Boolean(artist?.trim()))
        .map((artist) => artist.trim())
    )
  );

  if (uniqueArtists.length === 0) return '';
  if (uniqueArtists.length === 1) return uniqueArtists[0]!;
  if (uniqueArtists.length === 2) return uniqueArtists.join(' & ');

  const allButLast = uniqueArtists.slice(0, -1);
  const last = uniqueArtists[uniqueArtists.length - 1]!;
  return allButLast.join(', ') + ' & ' + last;
}

// Get product image URL with fallbacks
function getProductImageUrl(product: Product, width = 400, height = 400): string | null {
  if (!product?.mainImage) return null;

  if (product.mainImage.asset?.url) {
    return optimizeImageUrl(product.mainImage.asset.url, product.title);
  }

  return null;
}

// List of contributor names that should not be displayed
const HIDDEN_CONTRIBUTOR_NAMES = ['the mixtape shop', 'the mixtape club'];

// UPDATED: Helper function to extract contributor info from new structure
// Modified to hide specific contributors
function getContributorInfo(mixtape: Mixtape): {
  name: string | null;
  slug: string | null;
  shouldShow: boolean;
  contributors: Contributor[];
  primaryContributor: Contributor | null;
} {
  // Priority 1: New contributors array (populated references)
  if (mixtape.contributors && mixtape.contributors.length > 0) {
    // Filter out hidden contributors first
    const filteredContributors = mixtape.contributors.filter(
      (c) => c && c.name && !HIDDEN_CONTRIBUTOR_NAMES.includes(c.name.toLowerCase())
    );

    // If all contributors were filtered out, return no show
    if (filteredContributors.length === 0) {
      return {
        name: null,
        slug: null,
        shouldShow: false,
        contributors: [],
        primaryContributor: null
      };
    }

    const primaryContributor = filteredContributors[0] || null;

    return {
      name: primaryContributor?.name || null,
      slug: primaryContributor?.slug?.current || null,
      shouldShow: true,
      contributors: filteredContributors,
      primaryContributor
    };
  }

  // Priority 2: contributorNames string (fallback display name)
  if (mixtape.contributorNames) {
    // Check if this contributor name should be hidden
    if (HIDDEN_CONTRIBUTOR_NAMES.includes(mixtape.contributorNames.toLowerCase())) {
      return {
        name: null,
        slug: null,
        shouldShow: false,
        contributors: [],
        primaryContributor: null
      };
    }

    return {
      name: mixtape.contributorNames,
      slug: null,
      shouldShow: true,
      contributors: [],
      primaryContributor: null
    };
  }

  // Priority 3: _contributorNames (internal field)
  if (mixtape._contributorNames) {
    // Check if this contributor name should be hidden
    if (HIDDEN_CONTRIBUTOR_NAMES.includes(mixtape._contributorNames.toLowerCase())) {
      return {
        name: null,
        slug: null,
        shouldShow: false,
        contributors: [],
        primaryContributor: null
      };
    }

    return {
      name: mixtape._contributorNames,
      slug: null,
      shouldShow: true,
      contributors: [],
      primaryContributor: null
    };
  }

  // Priority 4: artist fallback
  if (mixtape.artist) {
    // Check if this artist name should be hidden
    if (HIDDEN_CONTRIBUTOR_NAMES.includes(mixtape.artist.toLowerCase())) {
      return {
        name: null,
        slug: null,
        shouldShow: false,
        contributors: [],
        primaryContributor: null
      };
    }

    return {
      name: mixtape.artist,
      slug: null,
      shouldShow: true,
      contributors: [],
      primaryContributor: null
    };
  }

  return {
    name: null,
    slug: null,
    shouldShow: false,
    contributors: [],
    primaryContributor: null
  };
}

// Helper function to format multiple contributors for display
function formatContributorNames(contributors: Contributor[]): string {
  if (!contributors || contributors.length === 0) return '';

  const names = contributors.map((c) => c.name).filter(Boolean);

  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(' & ');

  const allButLast = names.slice(0, -1);
  const last = names[names.length - 1];
  return allButLast.join(', ') + ' & ' + last;
}

// Helper function to check if a tag is a priority tag (case-insensitive)
function isPriorityTag(tag: string): boolean {
  return PRIORITY_TAGS.includes(tag.toLowerCase());
}

// Helper function to create tag archive URL
function getTagArchiveUrl(tag: string): string {
  // Convert tag to URL-friendly format (lowercase, replace spaces with hyphens)
  const tagSlug = tag
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/mixtapes/${tagSlug}`;
}

export default function MixtapeCard({
  mixtape,
  variant = 'regular',
  priority = false,
  index = 0,
  context = 'default',
  isFeatured = false,
  products = []
}: MixtapeCardProps) {
  const cardId = `mixtape-${mixtape._id}-idx${index}-${Date.now()}`;
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if this should use featured styling - NOT on product pages (inMixtapes context)
  const shouldUseFeaturedStyle = variant === 'featured' || isFeatured;

  // Check if this is one of the first 6 featured items
  const isInFirstSixFeatured = shouldUseFeaturedStyle && index < 6;

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize expensive computations
  const mixtapeData = useMemo(() => {
    const rawImageUrl = mixtape.featuredImage?.asset?.url || '';
    const imageUrl = optimizeImageUrl(rawImageUrl, mixtape.title);
    const blurDataURL = mixtape.featuredImage?.asset?.metadata?.lqip;
    const altText = mixtape.featuredImage?.alt || mixtape.title;

    // Build slug properly
    const slug =
      (typeof mixtape.slug === 'string' ? mixtape.slug : mixtape.slug?.current) || mixtape._id;
    const mixtapeUrl = `/mixtape/${slug}`;

    // Get contributor info using the updated helper function
    const contributorInfo = getContributorInfo(mixtape);

    // Extract artists from tracklist - matching WordPress logic exactly
    const musicByArtists = mixtape.tracklist?.map((track) => track.artist).filter(Boolean) || [];

    // Format artists string exactly like WordPress
    const musicByString = formatArtistsList(musicByArtists);

    // Get product images from tracklist with product references
    const productImages: Array<{ url: string; alt: string }> = [];

    if (mixtape.tracklist && products.length > 0) {
      mixtape.tracklist.forEach((track) => {
        if (track.product?._ref) {
          const product = products.find((p) => p._id === track.product?._ref);
          if (product) {
            const imageUrl = getProductImageUrl(product);
            if (imageUrl) {
              productImages.push({
                url: imageUrl,
                alt: product.title || track.trackTitle || 'Product image'
              });
            }
          }
        }
      });
    }

    // Check if we should show product grid (>5 products with images)
    const shouldShowProductGrid = productImages.length > 5;

    // Separate tags into priority (non-linkable) and regular (linkable) tags
    const priorityTags = mixtape.tags?.filter((tag) => isPriorityTag(tag)) || [];
    const regularTags = mixtape.tags?.filter((tag) => !isPriorityTag(tag)) || [];

    return {
      imageUrl,
      blurDataURL,
      altText,
      mixtapeUrl,
      contributorInfo,
      musicByArtists,
      musicByString,
      productImages,
      shouldShowProductGrid,
      priorityTags,
      regularTags
    };
  }, [mixtape, products]);

  // Preload critical images immediately on mount
  useEffect(() => {
    // Only run on client-side and only for priority images
    if (!priority || !mixtapeData.imageUrl || mixtapeData.imageUrl === '/placeholder.jpg') {
      return;
    }

    // Client-side only preloading
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.head) {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = mixtapeData.imageUrl;
        link.type = 'image/jpeg';
        document.head.appendChild(link);
      } catch (error) {
        // Silently fail if there's any issue
        console.warn('Failed to preload image:', error);
      }
    }
  }, [priority, mixtapeData.imageUrl]);

  // Simplified image load handler
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasLoaded(true);
  }, []);

  // Simplified error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.jpg';
  }, []);

  const {
    imageUrl,
    blurDataURL,
    altText,
    mixtapeUrl,
    contributorInfo,
    musicByArtists,
    musicByString,
    productImages,
    shouldShowProductGrid,
    priorityTags,
    regularTags
  } = mixtapeData;

  // Dynamic classes based on variant and context - matching ProductCard featured styling
  const cardClasses = shouldUseFeaturedStyle
    ? 'item-wrapper h-100 bg-black text-white'
    : 'item-wrapper h-100';

  const titleLinkClasses = shouldUseFeaturedStyle
    ? 'text-decoration-none text-white'
    : 'text-decoration-none text-reset';

  const imageClasses = shouldUseFeaturedStyle ? 'object-fit-cover p-5' : 'object-fit-cover';

  // Updated contentPadding logic to account for context
  const contentPadding = (() => {
    if (context === 'inMixtapes') return 'p-0 pt-2';
    return shouldUseFeaturedStyle ? 'p-3' : 'p-2';
  })();

  const metaTextClasses = shouldUseFeaturedStyle
    ? 'text-white small mb-2'
    : 'text-muted small mb-2';

  // For the link wrapper around image - no bg-black for featured items to show container background
  const imageLinkClasses = isInFirstSixFeatured
    ? 'd-block px-0 py-0 px-sm-5 py-sm-5 px-md-0 py-md-0 px-xl-5 py-xl-5'
    : shouldUseFeaturedStyle
      ? 'bg-black d-block'
      : 'bg-black d-block';

  // Product grid component - only shows on hover for md+ screens
  const ProductGrid = () => {
    if (!shouldShowProductGrid) return null;

    // Take first 10 images for 2 rows of 5
    const displayImages = productImages.slice(0, 10);

    return (
      <div
        className="product-grid position-absolute w-100 h-100 d-none d-md-flex align-items-center justify-content-center start-0 top-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
          zIndex: 10
        }}
      >
        <div className="w-100 p-3">
          <div className="row g-2">
            {/* First row */}
            <div className="col-12">
              <div className="row g-2">
                {displayImages.slice(0, 5).map((img, idx) => (
                  <div key={idx} className="col">
                    <div
                      className="product-image-container position-relative overflow-hidden rounded"
                      style={{
                        aspectRatio: '1/1',
                        width: '100%'
                      }}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-fit-cover"
                        sizes="(max-width: 768px) 20vw, (max-width: 1200px) 15vw, 10vw"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Second row if we have more than 5 images */}
            {displayImages.length > 5 && (
              <div className="col-12">
                <div className="row g-2">
                  {displayImages.slice(5, 10).map((img, idx) => (
                    <div key={idx + 5} className="col">
                      <div
                        className="product-image-container position-relative overflow-hidden rounded"
                        style={{
                          aspectRatio: '1/1',
                          width: '100%'
                        }}
                      >
                        <Image
                          src={img.url}
                          alt={img.alt}
                          fill
                          className="object-fit-cover"
                          sizes="(max-width: 768px) 20vw, (max-width: 1200px) 15vw, 10vw"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`mixtape m-0 mb-5 p-0`}>
      {/* Add container padding for 2x effect on featured items */}
      <div
        className={isInFirstSixFeatured ? 'px-sm-5 px-md-0 px-xl-5 px-0' : ''}
        style={{
          backgroundColor: 'black', // Always black background as fallback
          backgroundImage:
            isInFirstSixFeatured && isMounted && mixtape.featuredImage
              ? `url(${blurDataURL || imageUrl})` // Use LQIP first, then fallback to main image
              : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        {/* Dark overlay for the blurred background - only for first 6 featured */}
        {isInFirstSixFeatured && (
          <div
            className="position-absolute w-100 h-100 start-0 top-0"
            style={{
              backgroundColor: blurDataURL || imageUrl ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 1)', // Full black until image loads, then 70% overlay
              backdropFilter: blurDataURL || imageUrl ? 'blur(20px)' : 'none', // Only blur when there's an image
              zIndex: 0
            }}
          />
        )}

        {/* Image section with WordPress-style black background and blurred backdrop */}
        <Link
          href={mixtapeUrl}
          className={imageLinkClasses}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main image container with enforced 1:1 aspect ratio - responsive width using Bootstrap */}
          <div
            className={`position-relative mx-auto overflow-hidden ${
              isInFirstSixFeatured ? 'w-100 w-sm-60 w-md-100 w-xl-60' : 'w-100'
            }`}
            style={{
              aspectRatio: '1/1',
              zIndex: context === 'inMixtapes' ? 'auto' : 1
            }}
          >
            {/* Main image with proper constraints */}
            {isMounted && mixtape.featuredImage && (
              <div
                className="position-relative w-100 h-100"
                style={{
                  aspectRatio: '1/1',
                  overflow: 'hidden'
                }}
              >
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="transition-opacity"
                  priority={priority}
                  placeholder={blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={blurDataURL}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  unoptimized={true}
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'opacity 0.3s ease-in-out',
                    width: '100%',
                    height: '100%'
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}

            {/* Product grid overlay - only shows on hover for md+ */}
            {shouldShowProductGrid && <ProductGrid />}
          </div>
        </Link>
      </div>

      {/* Card body - text content outside the black background */}
      <div
        className={`card-body row d-flex m-0 p-0 pe-3 ${
          context === 'inMixtapes' ? 'ps-0' : 'ps-2'
        } pt-2`}
      >
        <div
          className={`col d-flex align-items-center m-0 p-0 ${
            context === 'inMixtapes' ? '' : 'pe-4'
          }`}
        >
          <div className="info col">
            <div className={`m-0 ${context === 'inMixtapes' ? '' : 'me-3'}`}>
              {/* Contributor name - ONLY SHOW if available AND not in hidden list */}
              <div className="lh-sm">
                {contributorInfo.shouldShow && contributorInfo.name && (
                  <span className="me-2">
                    {contributorInfo.slug ? (
                      <Link
                        href={`/contributor/${contributorInfo.slug}`}
                        className="text-decoration-none text-muted"
                      >
                        {contributorInfo.name}
                      </Link>
                    ) : (
                      <span className="text-muted">{contributorInfo.name}</span>
                    )}
                    {/* Show additional contributors if there are multiple */}
                    {contributorInfo.contributors.length > 1 && (
                      <span className="text-muted">
                        {' & '}
                        {formatContributorNames(contributorInfo.contributors.slice(1))}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Title - make it bold */}
              <h2 className="mixtape_title fs-6 fw-bold lh-sm">
                <Link href={mixtapeUrl} className="text-decoration-none">
                  {mixtape.title}
                </Link>
              </h2>
            </div>
          </div>
        </div>

        {/* Music by section - only for featured items with tracklist */}
        {shouldUseFeaturedStyle && musicByArtists.length > 0 && (
          <div className={`musicby m-0 ${(context as any) === 'inMixtapes' ? 'px-0' : 'p-0'}`}>
            <p className="small italic">Music by {musicByString}</p>
          </div>
        )}

        {/* Tags section - show priority tags first, then regular tags (all linkable) */}
        {(priorityTags.length > 0 || regularTags.length > 0) && (
          <div
            className={`small tags d-flex m-0 mt-2 flex-wrap ${
              context === 'inMixtapes' ? 'px-0' : 'p-0'
            }`}
          >
            {/* Priority tags first (linkable) */}
            {priorityTags.map((tag, tagIndex) => (
              <Link
                key={`priority-${tagIndex}`}
                href={getTagArchiveUrl(tag)}
                className="small mono text-decoration-none text-muted me-3"
                style={{
                  transition: 'color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
              >
                {tag}
              </Link>
            ))}

            {/* Regular tags (linkable) in order of entry */}
            {regularTags.map((tag, tagIndex) => (
              <Link
                key={`regular-${tagIndex}`}
                href={getTagArchiveUrl(tag)}
                className="small mono text-decoration-none text-muted me-3"
                style={{
                  transition: 'color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '';
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
