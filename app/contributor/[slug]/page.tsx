// app/contributor/[slug]/page.tsx - Fixed Dynamic route for contributor pages
import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import MixtapeSubmenuProvider from 'components/layout/header/mixtapeSubmenuProvider';
import MixtapeCard from 'components/mixtapes/MixtapeCard';
import { urlFor } from 'lib/cms';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Contributor {
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
}

interface ContributorPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
  };
}

// Helper function to get contributor and their mixtapes
async function getContributorData(slug: string) {
  try {
    console.log('🔍 Fetching contributor with slug:', slug);

    // Import sanity client - now it should be properly exported
    const { sanityClient } = await import('lib/cms');

    if (!sanityClient) {
      console.error('❌ Sanity client not found');
      return { contributor: null, mixtapes: [] };
    }

    // First check if contributor exists at all (for debugging)
    const contributorExists = await sanityClient.fetch(
      `*[_type == "contributor" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        archived
      }`,
      { slug }
    );

    console.log('📊 Contributor exists check:', contributorExists);

    if (!contributorExists) {
      console.log('❌ No contributor found with slug:', slug);
      return { contributor: null, mixtapes: [] };
    }

    // Try different approaches for the archived filter
    let contributor = null;

    // First try with archived != true
    contributor = await sanityClient.fetch(
      `*[_type == "contributor" && slug.current == $slug && archived != true][0] {
        _id,
        name,
        slug,
        image,
        featured,
        archived,
        location,
        bio,
        socialLinks
      }`,
      { slug }
    );

    // If that fails, try with just archived (falsy check)
    if (!contributor) {
      console.log('🔄 Trying with archived check...');
      contributor = await sanityClient.fetch(
        `*[_type == "contributor" && slug.current == $slug && archived != true][0] {
          _id,
          name,
          slug,
          image,
          featured,
          archived,
          location,
          bio,
          socialLinks
        }`,
        { slug }
      );
    }

    // If that fails, check without archived filter but verify it manually
    if (!contributor) {
      console.log('🔄 Trying without archived filter...');
      const potentialContributor = await sanityClient.fetch(
        `*[_type == "contributor" && slug.current == $slug][0] {
          _id,
          name,
          slug,
          image,
          featured,
          archived,
          location,
          bio,
          socialLinks
        }`,
        { slug }
      );

      // Check if archived is not true (treat undefined as active)
      if (
        potentialContributor &&
        (potentialContributor.archived !== true || potentialContributor.archived !== true)
      ) {
        contributor = potentialContributor;
      }
    }

    if (!contributor) {
      console.log('❌ Contributor not active or not found');
      return { contributor: null, mixtapes: [] };
    }

    console.log('✅ Contributor found:', contributor.name);

    // Get mixtapes by this contributor - check multiple ways mixtapes can be linked
    const mixtapes = await sanityClient.fetch(
      `*[_type == "mixtape" && !(_id in path("drafts.**")) && (
        // Check if mixtape ID is in contributor's mixtapes array
        _id in *[_type == "contributor" && _id == $contributorId].mixtapes[]._ref ||
        // Check direct contributor reference
        contributorRef._ref == $contributorId ||
        // Check string matches
        contributorString == $contributorName ||
        contributor == $contributorName ||
        // Check if contributor is in contributors array
        $contributorId in contributors[]._ref
      )] | order(orderRank asc, publishedAt desc, _createdAt desc) {
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
        contributors,
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
      }`,
      {
        contributorId: contributor._id,
        contributorName: contributor.name
      }
    );

    console.log('📊 Mixtape query executed with:', {
      contributorId: contributor._id,
      contributorName: contributor.name,
      mixtapesFound: mixtapes?.length || 0
    });

    // Also check what mixtape "bed" contains
    if (mixtapes?.length === 0) {
      console.log('🔍 No mixtapes found, checking specific mixtape "bed"...');
      const bedMixtape = await sanityClient.fetch(
        `*[_type == "mixtape" && _id == "bed"][0] {
          _id,
          title,
          contributor,
          contributorString,
          contributors,
          contributorRef
        }`
      );
      console.log('📊 Mixtape "bed" details:', bedMixtape);
    }

    console.log('📊 Mixtapes found:', mixtapes?.length || 0);

    return { contributor, mixtapes: mixtapes || [] };
  } catch (error) {
    console.error('❌ Error fetching contributor data:', error);
    return { contributor: null, mixtapes: [] };
  }
}

// Helper function to get all contributors for static generation
async function getAllContributors() {
  try {
    // Import sanity client - now it should be properly exported
    const { sanityClient } = await import('lib/cms');

    if (!sanityClient) {
      console.error('❌ Sanity client not found in getAllContributors');
      return [];
    }
    // Try multiple approaches for getting active contributors
    let contributors = await sanityClient.fetch(
      `*[_type == "contributor" && archived != true] {
        "slug": slug.current
      }`
    );

    // If no results, try with truthy check
    if (!contributors?.length) {
      contributors = await sanityClient.fetch(
        `*[_type == "contributor" && archived != true] {
          "slug": slug.current
        }`
      );
    }

    // If still no results, get all and filter manually
    if (!contributors?.length) {
      const allContributors = await sanityClient.fetch(
        `*[_type == "contributor"] {
          "slug": slug.current,
          archived
        }`
      );

      contributors =
        allContributors?.filter((c: any) => c.archived !== true || c.archived !== true) || [];
    }

    return contributors?.map((c: any) => c.slug).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

// Helper function to get contributor image URL
function getContributorImageUrl(contributor: Contributor, size = 120): string | null {
  if (!contributor?.image?.asset) return null;

  try {
    return urlFor(contributor.image).width(size).height(size).url();
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
}

// Generate metadata for the contributor page
export async function generateMetadata({ params }: ContributorPageProps): Promise<Metadata> {
  const { contributor } = await getContributorData(params.slug);

  if (!contributor) {
    return {
      title: 'Contributor Not Found',
      description: 'The requested contributor was not found.',
      robots: { index: false, follow: false }
    };
  }

  const contributorImageUrl = getContributorImageUrl(contributor, 400);

  return {
    title: `${contributor.name} - Mixtapes & Music Collections`,
    description:
      contributor.bio ||
      `Discover mixtapes and music collections curated by ${contributor.name}. Explore their unique musical perspective and style.`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    openGraph: {
      title: `${contributor.name} - Mixtapes`,
      description: contributor.bio || `Mixtapes and music collections by ${contributor.name}`,
      type: 'profile',
      ...(contributorImageUrl && {
        images: [
          {
            url: contributorImageUrl,
            width: 400,
            height: 400,
            alt: contributor.name
          }
        ]
      })
    }
  };
}

// Generate static params for all contributors

export default async function ContributorPage({ params, searchParams }: ContributorPageProps) {
  const startTime = Date.now();
  const { contributor, mixtapes } = await getContributorData(params.slug);

  if (!contributor) {
    console.log('🚫 404 - Contributor not found for slug:', params.slug);
    notFound();
  }

  console.log(
    `🎧 [${Date.now() - startTime}ms] ${contributor.name}: ${mixtapes?.length || 0} mixtapes loaded`
  );

  const contributorImageUrl = getContributorImageUrl(contributor, 120);

  // Generate JSON-LD schema for the contributor page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: contributor.name,
    description: contributor.bio,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/contributor/${contributor.slug.current}`,
    ...(contributorImageUrl && { image: contributorImageUrl }),
    ...(contributor.location && { address: contributor.location }),
    sameAs: Object.values(contributor.socialLinks || {}).filter(Boolean),
    worksFor: {
      '@type': 'Organization',
      name: 'The Mixtape Shop'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
        }}
      />

      {/* Include submenu */}
      <MixtapeSubmenuProvider />

      {/* Contributor Header */}
      <div className="row py-5">
        <div className="col-12 col-lg-8 mx-auto text-center">
          {/* Contributor Image */}
          {contributorImageUrl && (
            <div className="mb-4">
              <Image
                src={contributorImageUrl}
                alt={contributor.name}
                width={120}
                height={120}
                className="rounded-circle d-block mx-auto"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          )}

          {/* Contributor Info */}
          <h1 className="display-5 fw-bold mb-2">{contributor.name}</h1>

          {contributor.location && (
            <p className="text-muted mb-3">
              <i className="bi bi-geo-alt-fill me-1"></i>
              {contributor.location}
            </p>
          )}

          {contributor.bio && (
            <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '600px' }}>
              {contributor.bio}
            </p>
          )}

          {/* Social Links */}
          {contributor.socialLinks && (
            <div className="d-flex justify-content-center mb-4 gap-3">
              {contributor.socialLinks.website && (
                <a
                  href={contributor.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-globe me-1"></i>Website
                </a>
              )}
              {contributor.socialLinks.mixcloud && (
                <a
                  href={contributor.socialLinks.mixcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-music-note me-1"></i>Mixcloud
                </a>
              )}
              {contributor.socialLinks.soundcloud && (
                <a
                  href={contributor.socialLinks.soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-soundwave me-1"></i>SoundCloud
                </a>
              )}
              {contributor.socialLinks.instagram && (
                <a
                  href={contributor.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-instagram me-1"></i>Instagram
                </a>
              )}
              {contributor.socialLinks.twitter && (
                <a
                  href={contributor.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                >
                  <i className="bi bi-twitter me-1"></i>Twitter
                </a>
              )}
            </div>
          )}

          {/* Mixtape Count */}
          {/* <p className="small text-muted">
              {mixtapes.length} {mixtapes.length === 1 ? 'mixtape' : 'mixtapes'}
            </p> */}
        </div>
      </div>

      {/* Mixtapes Section */}
      {mixtapes.length > 0 ? (
        <>
          <GridContainer>
            {mixtapes.map((mixtape: any, index: number) => {
              const mixtapeId = mixtape?.id || mixtape?._id;

              if (!mixtape || !mixtapeId) {
                console.warn(`🎧 Skipping malformed mixtape at index ${index}`);
                return null;
              }

              // First 6 items are featured
              const isFeatured = index < 6;
              const featuredContainer = 'col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4';
              const normalContainer = 'col-6 col-sm-4 col-lg-3';
              const containerClass = isFeatured ? featuredContainer : normalContainer;

              // Extract artists from tracklist for "music by" section
              const musicByArtists =
                mixtape.tracklist?.map((track: any) => track.artist).filter(Boolean) || [];
              const uniqueArtists = [...new Set(musicByArtists)];

              return (
                <GridItem
                  key={`contributor-${contributor.slug.current}-mixtape-${mixtapeId}-${index}`}
                  type="mixtape"
                  id={mixtapeId}
                  inStock={true}
                  category={mixtape.genre || 'Mixtape'}
                  className={containerClass}
                >
                  <MixtapeCard
                    mixtape={mixtape}
                    variant={isFeatured ? 'featured' : 'regular'}
                    isFeatured={isFeatured}
                    priority={index < 6}
                    index={index}
                    context="default"
                  />
                </GridItem>
              );
            })}
          </GridContainer>
        </>
      ) : (
        <div className="row py-5">
          <div className="col-12 text-center">
            <h2 className="h4 fw-semibold mb-3">No Mixtapes Yet</h2>
            <p className="text-muted mb-4">{contributor.name} hasn't published any mixtapes yet.</p>
            <Link href="/mixtapes" className="btn btn-primary">
              Browse All Mixtapes
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
export const revalidate = 3600;
