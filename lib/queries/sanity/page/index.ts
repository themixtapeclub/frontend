// lib/queries/sanity/page/index.ts

// Page base fields using your existing fragment pattern
const pageBaseFields = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  pageType,
  metaDescription,
  lastUpdated,
  isPublished,
  heroImage {
    asset->{
      _id,
      url,
      metadata {
        lqip,
        dimensions {
          width,
          height
        }
      }
    },
    alt,
    crop,
    hotspot
  }
`;

// Page content fragment with image support
const pageContentFragment = `
  content[] {
    ...,
    _type == "image" => {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt,
      crop,
      hotspot
    }
  }
`;

// Complete page fields
export const PAGE_QUERY_FIELDS = `
  ${pageBaseFields},
  ${pageContentFragment}
`;

// Get a single page by slug
export const getPageBySlugQuery = `
  *[_type == "page" && slug.current == $slug && isPublished == true][0] {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Get all published pages
export const getAllPagesQuery = `
  *[_type == "page" && isPublished == true] | order(_createdAt desc) {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Get pages by type
export const getPagesByTypeQuery = `
  *[_type == "page" && pageType == $pageType && isPublished == true] | order(_createdAt desc) {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Get page slugs for static generation
export const getPageSlugsQuery = `
  *[_type == "page" && isPublished == true && defined(slug.current)].slug.current
`;

// Get a page preview (for draft mode)
export const getPagePreviewQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Search pages by title or content
export const searchPagesQuery = `
  *[_type == "page" && isPublished == true && (
    title match $searchTerm ||
    pt::text(content) match $searchTerm
  )] | order(_score desc) {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Get recent pages
export const getRecentPagesQuery = `
  *[_type == "page" && isPublished == true] | order(_createdAt desc)[0...$limit] {
    ${PAGE_QUERY_FIELDS}
  }
`;

// Type definitions for the queries
export interface PageData {
  _id: string;
  _type: 'page';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  pageType: 'info' | 'shipping' | 'grading' | 'faq' | 'terms' | 'privacy' | 'general';
  metaDescription?: string;
  content?: any[]; // Portable text content
  lastUpdated?: string;
  isPublished: boolean;
}

// Query parameters types
export interface PageQueryParams {
  slug?: string;
  pageType?: string;
  searchTerm?: string;
  limit?: number;
}
