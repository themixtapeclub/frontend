// lib/queries/sanity/mixtapes/queries.ts
// Mixtape-specific queries with consistent draft exclusion - UPDATED for multiple contributors and pagination

import {
  BASE_MIXTAPE_FILTER,
  IMAGE_FRAGMENT,
  MIXTAPE_CARD_FRAGMENT,
  MIXTAPE_FULL_FRAGMENT
} from '../core/constants';

export const MIXTAPE_QUERIES = {
  // Featured mixtapes only
  featured: (limit: number = 6) => `
    *[${BASE_MIXTAPE_FILTER} && featured == true] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // Recent mixtapes ordered by orderRank
  recent: (limit: number = 10) => `
    *[${BASE_MIXTAPE_FILTER}] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // Featured first, then non-featured (simple approach)
  featuredFirst: (limit: number = 10) => `
    (*[${BASE_MIXTAPE_FILTER} && featured == true] | order(orderRank asc)) +
    (*[${BASE_MIXTAPE_FILTER} && featured != true] | order(orderRank asc))
    [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // The Mixtape Shop items - UPDATED: Check new contributor structure
  mixtapeShop: () => `
    *[${BASE_MIXTAPE_FILTER} && (
      count(contributors[]->.name[match("*The Mixtape Shop*")]) > 0 ||
      contributorNames match "*The Mixtape Shop*" ||
      _contributorNames match "*The Mixtape Shop*"
    )] | order(orderRank asc) {
      ${MIXTAPE_CARD_FRAGMENT},
      tags
    }
  `,

  // Single mixtape by slug
  bySlug: (slug: string) => `
    *[${BASE_MIXTAPE_FILTER} && slug.current == $slug][0] {
      ${MIXTAPE_FULL_FRAGMENT}
    }
  `,

  // Find mixtapes containing a product
  containingProduct: (productId: string, sku?: string, swellProductId?: string) => `
    *[${BASE_MIXTAPE_FILTER}] {
      _id,
      title,
      slug { current },
      featuredImage {
        ${IMAGE_FRAGMENT}
      },
      mixcloudUrl,
      publishedAt,
      contributors[]->{
        _id,
        name,
        slug,
        featured,
        isActive,
        location
      },
      contributorNames,
      _contributorNames,
      "matchingTracks": tracklist[
        productId == $productId ||
        product._ref == $productId ||
        product._ref == $sku ||
        wpProductId == $swellProductId
      ] {
        _key,
        trackTitle,
        artist,
        productId,
        wpProductId
      }
    }[count(matchingTracks) > 0] {
      _id,
      title,
      slug,
      featuredImage,
      mixcloudUrl,
      publishedAt,
      contributors,
      contributorNames,
      _contributorNames,
      "trackTitle": matchingTracks[0].trackTitle,
      "trackArtist": matchingTracks[0].artist
    }
  `,

  // Mixtapes by tag (string-based - matches your data structure)
  byTag: (tag: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && $tag in tags] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags
    }
  `,

  // NEW: Mixtapes by tag with pagination
  byTagPaginated: (tag: string, offset: number, limit: number) => `
    *[${BASE_MIXTAPE_FILTER} && $tag in tags] | order(orderRank asc) [${offset}...${
      offset + limit
    }] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags
    }
  `,

  // NEW: Count mixtapes by tag
  countByTag: (tag: string) => `
    count(*[${BASE_MIXTAPE_FILTER} && $tag in tags])
  `,

  // Mixtapes by tag (case-insensitive)
  byTagCaseInsensitive: (tag: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && count(tags[lower(@) == lower($tag)]) > 0] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags
    }
  `,

  // Mixtapes by multiple tags
  byTags: (tags: string[], limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && count(tags[]->slug.current[@ in $tags]) > 0] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags[]->{
        _id,
        title,
        slug { current }
      }
    }
  `,

  // Favorites mixtapes (based on featured field from your data)
  favorites: (limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && featured == true] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags,
      featured
    }
  `,

  // NEW: Favorites with pagination
  favoritesPaginated: (offset: number, limit: number) => `
    *[${BASE_MIXTAPE_FILTER} && featured == true] | order(orderRank asc) [${offset}...${
      offset + limit
    }] {
      ${MIXTAPE_CARD_FRAGMENT},
      tags,
      featured
    }
  `,

  // NEW: Count favorites
  countFavorites: () => `
    count(*[${BASE_MIXTAPE_FILTER} && featured == true])
  `,

  // Get all available tags (from string arrays in your data)
  getAllTags: () => `
    array::unique(*[${BASE_MIXTAPE_FILTER}].tags[])
  `,

  // Mixtapes by genre/mood (if different from tags)
  byGenre: (genre: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && genre->slug.current == $genre] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT},
      genre->{
        _id,
        title,
        slug { current }
      }
    }
  `,

  // UPDATED: Search mixtapes by keyword - new contributor structure
  search: (keyword: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && (
      title match $keyword ||
      description match $keyword ||
      count(contributors[]->.name[match($keyword)]) > 0 ||
      contributorNames match $keyword ||
      _contributorNames match $keyword ||
      tags[]->title match $keyword
    )] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // Mixtapes by specific contributor ID
  byContributor: (contributorId: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && count(contributors[]._ref[@ == $contributorId]) > 0] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // Mixtapes by contributor name
  byContributorName: (contributorName: string, limit: number = 48) => `
    *[${BASE_MIXTAPE_FILTER} && (
      count(contributors[]->.name[@ == $contributorName]) > 0 ||
      contributorNames == $contributorName ||
      _contributorNames == $contributorName
    )] | order(orderRank asc) [0...${limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // OPTIONAL: General pagination function for any filter
  paginated: (
    additionalFilter: string,
    offset: number,
    limit: number,
    sort: string = 'orderRank asc'
  ) => `
    *[${BASE_MIXTAPE_FILTER}${
      additionalFilter ? ` && ${additionalFilter}` : ''
    }] | order(${sort}) [${offset}...${offset + limit}] {
      ${MIXTAPE_CARD_FRAGMENT}
    }
  `,

  // OPTIONAL: Count with additional filter
  countWithFilter: (additionalFilter: string) => `
    count(*[${BASE_MIXTAPE_FILTER}${additionalFilter ? ` && ${additionalFilter}` : ''}])
  `
};
