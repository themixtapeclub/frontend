// src/lib/data/contributors.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";

export interface Contributor {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  location?: string | null;
  instagram?: string | null;
  website?: string | null;
  wp_id?: number;
  mixtape_count?: number;
}

export interface ContributorResponse {
  contributor: Contributor;
}

export interface ContributorsResponse {
  contributors: Contributor[];
}

function normalizeMixtape(mixtape: any): any {
  return {
    ...mixtape,
    contributors: mixtape.contributors || mixtape.contributor || [],
  };
}

function normalizeMixtapes(mixtapes: any[]): any[] {
  return mixtapes.map(normalizeMixtape);
}

export async function getContributor(slug: string): Promise<Contributor | null> {
  const url = BACKEND_URL + "/contributors/" + slug;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch contributor:", res.status);
      return null;
    }
    
    const data: ContributorResponse = await res.json();
    return data.contributor;
  } catch (error) {
    console.error("Error fetching contributor:", error);
    return null;
  }
}

export async function getContributors(): Promise<Contributor[]> {
  const url = BACKEND_URL + "/contributors";
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch contributors:", res.status);
      return [];
    }
    
    const data: ContributorsResponse = await res.json();
    return data.contributors;
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return [];
  }
}

export async function getContributorMixtapes(slug: string, options?: {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}): Promise<{ mixtapes: any[]; pagination: any }> {
  const params = new URLSearchParams();
  
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.includeArchived) params.set("includeArchived", "true");
  
  const url = BACKEND_URL + "/contributors/" + slug + "/mixtapes?" + params.toString();
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch contributor mixtapes:", res.status);
      return { mixtapes: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } };
    }
    
    const data = await res.json();
    return {
      mixtapes: normalizeMixtapes(data.mixtapes || []),
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error fetching contributor mixtapes:", error);
    return { mixtapes: [], pagination: { page: 1, limit: 24, total: 0, totalPages: 0 } };
  }
}
