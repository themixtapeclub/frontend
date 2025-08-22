// lib/data/contributors.ts - Helper functions for contributor data
import { sanityClient } from 'lib/cms';

export interface Contributor {
  _id: string;
  name: string;
  slug: {
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
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    soundcloud?: string;
    mixcloud?: string;
    website?: string;
  };
  _createdAt?: string;
  _updatedAt?: string;
}

export interface ContributorWithMixtapes extends Contributor {
  mixtapeCount?: number;
  latestMixtape?: {
    title: string;
    slug: { current: string };
    publishedAt?: string;
  };
}

// Get all active contributors
export async function getAllContributors(): Promise<Contributor[]> {
  try {
    const contributors = await sanityClient.fetch(
      `
      *[_type == "contributor" && archived != true] | order(name asc) {
        _id,
        name,
        slug,
        image,
        featured,
        archived,
        location,
        bio,
        socialLinks,
        _createdAt,
        _updatedAt
      }
    `
    );

    return contributors || [];
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

// Get all featured contributors
export async function getFeaturedContributors(): Promise<Contributor[]> {
  try {
    const contributors = await sanityClient.fetch(
      `
      *[_type == "contributor" && archived != true && featured == true] | order(name asc) {
        _id,
        name,
        slug,
        image,
        featured,
        archived,
        location,
        bio,
        socialLinks,
        _createdAt,
        _updatedAt
      }
    `
    );

    return contributors || [];
  } catch (error) {
    console.error('Error fetching featured contributors:', error);
    return [];
  }
}

// Get contributors with their mixtape counts
export async function getContributorsWithCounts(): Promise<ContributorWithMixtapes[]> {
  try {
    const contributors = await sanityClient.fetch(
      `
      *[_type == "contributor" && archived != true] | order(name asc) {
        _id,
        name,
        slug,
        image,
        featured,
        archived,
        location,
        bio,
        socialLinks,
        "mixtapeCount": count(*[_type == "mixtape" && !(_id in path("drafts.**")) && (
          contributorRef._ref == ^._id ||
          contributorString == ^.name ||
          contributor == ^.name
        )]),
        "latestMixtape": *[_type == "mixtape" && !(_id in path("drafts.**")) && (
          contributorRef._ref == ^._id ||
          contributorString == ^.name ||
          contributor == ^.name
        )] | order(publishedAt desc, _createdAt desc) [0] {
          title,
          slug,
          publishedAt
        },
        _createdAt,
        _updatedAt
      }
    `
    );

    return contributors || [];
  } catch (error) {
    console.error('Error fetching contributors with counts:', error);
    return [];
  }
}

// Get a single contributor by slug
export async function getContributor(slug: string): Promise<Contributor | null> {
  try {
    const contributor = await sanityClient.fetch(
      `
      *[_type == "contributor" && slug.current == $slug && archived != true][0] {
        _id,
        name,
        slug,
        image,
        featured,
        archived,
        location,
        bio,
        socialLinks,
        _createdAt,
        _updatedAt
      }
    `,
      { slug }
    );

    return contributor || null;
  } catch (error) {
    console.error('Error fetching contributor:', error);
    return null;
  }
}

// Get mixtapes by contributor
export async function getMixtapesByContributor(contributorSlug: string, limit = 50) {
  try {
    // First get the contributor
    const contributor = await getContributor(contributorSlug);

    if (!contributor) {
      return [];
    }

    // Then get their mixtapes
    const mixtapes = await sanityClient.fetch(
      `
      *[_type == "mixtape" && !(_id in path("drafts.**")) && (
        contributorRef._ref == $contributorId ||
        contributorString == $contributorName ||
        contributor == $contributorName
      )] | order(orderRank asc, publishedAt desc, _createdAt desc) [0...$limit] {
        _id,
        title,
        description,
        featuredImage {
          _type,
          alt,
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          }
        },
        artist,
        contributor,
        contributorString,
        releaseDate,
        publishedAt,
        duration,
        slug,
        genre,
        featured,
        mixcloudUrl,
        tags,
        tracklist[] {
          _key,
          trackTitle,
          artist
        },
        _createdAt
      }
    `,
      {
        contributorId: contributor._id,
        contributorName: contributor.name,
        limit
      }
    );

    return mixtapes || [];
  } catch (error) {
    console.error('Error fetching mixtapes by contributor:', error);
    return [];
  }
}

// Check if contributor slug exists
export async function isValidContributorSlug(slug: string): Promise<boolean> {
  try {
    const contributor = await sanityClient.fetch(
      `*[_type == "contributor" && slug.current == $slug && archived != true][0]._id`,
      { slug }
    );

    return !!contributor;
  } catch (error) {
    console.error('Error validating contributor slug:', error);
    return false;
  }
}

// Get all contributor slugs for static generation
export async function getAllContributorSlugs(): Promise<string[]> {
  try {
    const slugs = await sanityClient.fetch(
      `*[_type == "contributor" && archived != true].slug.current`
    );

    return slugs?.filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching contributor slugs:', error);
    return [];
  }
}
