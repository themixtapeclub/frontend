// src/lib/data/mixtapes.ts

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";

export interface Contributor {
  id: string;
  name: string;
  slug: string;
  wp_id?: number;
  image_url?: string | null;
  location?: string | null;
  instagram?: string | null;
  website?: string | null;
}

export interface TrackProduct {
  id: string;
  title: string;
  handle: string;
  artist: string[];
  thumbnail: string;
  price: number;
}

export interface Track {
  trackTitle: string;
  artist: string;
  location?: string;
  productId?: string;
  productHandle?: string;
  product?: TrackProduct;
}

export interface Mixtape {
  id: string;
  title: string;
  slug: string;
  description?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  mixcloud_url?: string;
  tags: string[];
  featured: boolean;
  published_at?: string;
  contributors: Contributor[];
  contributor?: Contributor[];
  tracklist?: Track[];
  track_count?: number;
  seo_title?: string;
  seo_description?: string;
}

export interface MixtapesResponse {
  mixtapes: Mixtape[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RelatedMixtapesResponse {
  mixtapes: Mixtape[];
  byContributor: Mixtape[];
  byTags: Mixtape[];
}

export interface RelatedProductsDebug {
  tracklistProductCount: number;
  tags: string[];
  tracklistProducts: Array<{
    id: string;
    title: string;
    handle: string;
    genre: string[];
  }>;
}

export interface RelatedProduct {
  id: string;
  title: string;
  handle: string;
  artist: string[];
  thumbnail: string;
  price_usd: number;
  label: string[];
  genre: string[];
  tag_match_count: number;
  matching_tags: string[];
}

export interface RelatedProductsResponse {
  products: RelatedProduct[];
  debug?: RelatedProductsDebug;
}

function normalizeContributors(mixtape: any): Contributor[] {
  return mixtape.contributors || mixtape.contributor || [];
}

function normalizeMixtape(mixtape: any): Mixtape {
  return {
    ...mixtape,
    contributors: normalizeContributors(mixtape),
  };
}

function normalizeMixtapes(mixtapes: any[]): Mixtape[] {
  return mixtapes.map(normalizeMixtape);
}

export async function getMixtapes(options?: {
  page?: number;
  limit?: number;
  offset?: number;
  tag?: string;
  featured?: boolean;
  contributor?: string;
}): Promise<MixtapesResponse> {
  const params = new URLSearchParams();
  
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset !== undefined) params.set("offset", String(options.offset));
  if (options?.tag) params.set("tag", options.tag);
  if (options?.featured !== undefined) params.set("featured", String(options.featured));
  if (options?.contributor) params.set("contributor", options.contributor);
  
  const url = BACKEND_URL + "/mixtapes?" + params.toString();
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch mixtapes:", res.status);
      return { mixtapes: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } };
    }
    
    const data = await res.json();
    return {
      mixtapes: normalizeMixtapes(data.mixtapes || []),
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error fetching mixtapes:", error);
    return { mixtapes: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } };
  }
}

export async function getMixtape(slug: string): Promise<Mixtape | null> {
  const url = BACKEND_URL + "/mixtapes/" + slug;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch mixtape:", res.status);
      return null;
    }
    
    const data = await res.json();
    return data.mixtape ? normalizeMixtape(data.mixtape) : null;
  } catch (error) {
    console.error("Error fetching mixtape:", error);
    return null;
  }
}

export function formatContributorNames(contributors: Contributor[]): string {
  if (!contributors || contributors.length === 0) return "";
  
  const names = contributors.map(c => c.name).filter(Boolean);
  
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(" & ");
  
  const allButLast = names.slice(0, -1);
  const last = names[names.length - 1];
  return allButLast.join(", ") + " & " + last;
}

const HIDDEN_CONTRIBUTORS = ["the mixtape shop", "the mixtape club"];

export function shouldShowContributor(name: string): boolean {
  if (!name) return false;
  return !HIDDEN_CONTRIBUTORS.includes(name.toLowerCase());
}

export function getVisibleContributors(contributors: Contributor[]): Contributor[] {
  return contributors.filter(c => c?.name && shouldShowContributor(c.name));
}

export async function getRelatedMixtapes(slug: string, contributorLimit: number = 8, tagLimit: number = 12): Promise<RelatedMixtapesResponse> {
  const url = BACKEND_URL + "/mixtapes/" + slug + "/related?contributorLimit=" + contributorLimit + "&tagLimit=" + tagLimit;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      return { mixtapes: [], byContributor: [], byTags: [] };
    }
    
    const data = await res.json();
    return {
      mixtapes: normalizeMixtapes(data.mixtapes || []),
      byContributor: normalizeMixtapes(data.byContributor || []),
      byTags: normalizeMixtapes(data.byTags || []),
    };
  } catch (error) {
    console.error("Error fetching related mixtapes:", error);
    return { mixtapes: [], byContributor: [], byTags: [] };
  }
}

export async function getMixtapeRelatedProducts(slug: string, limit: number = 12, debug: boolean = false): Promise<RelatedProductsResponse> {
  const url = BACKEND_URL + "/mixtapes/" + slug + "/products?limit=" + limit + (debug ? "&debug=true" : "");
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      return { products: [] };
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching related products:", error);
    return { products: [] };
  }
}

export async function getTracklistProducts(slug: string): Promise<any[]> {
  const url = BACKEND_URL + "/mixtapes/" + slug + "/tracklist-products";
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching tracklist products:", error);
    return [];
  }
}

export async function getMixtapesByContributor(contributorSlug: string, limit: number = 24): Promise<Mixtape[]> {
  const url = BACKEND_URL + "/mixtapes?contributor=" + contributorSlug + "&limit=" + limit;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return normalizeMixtapes(data.mixtapes || []);
  } catch (error) {
    console.error("Error fetching contributor mixtapes:", error);
    return [];
  }
}
