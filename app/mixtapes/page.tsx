// app/mixtapes/page.tsx
import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import MixtapeSubmenuProvider from 'components/layout/header/mixtapeSubmenuProvider';
import MixtapeCard from 'components/mixtapes/MixtapeCard';
import { getFavoritesMixtapes, getMixtapes, getMixtapesByTag } from 'lib/data/mixtapes';
import { slugToDisplayName } from 'lib/utils/slug';
import type { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'edge';
export const revalidate = 1800;

const VALID_TAGS = ['groovy', 'chill', 'global', 'healing', 'dance', 'nostalgia'];

interface MixtapesPageProps {
  searchParams: Promise<{
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: MixtapesPageProps): Promise<Metadata> {
  const { tag } = await searchParams;

  if (tag === 'favorites') {
    return {
      title: 'Favorite Mixtapes - Curated Music Collections',
      description: 'Our favorite mixtapes and curated music collections. The best of the best.',
      robots: { index: true, follow: true }
    };
  }

  if (tag && VALID_TAGS.includes(tag)) {
    const displayName = slugToDisplayName(tag);
    return {
      title: `${displayName} Mixtapes - Curated Music Collections`,
      description: `Discover ${displayName.toLowerCase()} mixtapes. Curated collections of music that capture the ${displayName.toLowerCase()} vibe.`,
      robots: { index: true, follow: true }
    };
  }

  return {
    title: 'Mixtapes - Curated Music Collections',
    description:
      'Discover curated mixtapes and music collections. From groovy to chill, find your perfect musical journey.',
    robots: { index: true, follow: true }
  };
}

export default async function MixtapesPage({ searchParams }: MixtapesPageProps) {
  const { tag, sort } = await searchParams;
  const sortBy = sort || 'recent';

  let mixtapes: any[] = [];
  let pageTitle = 'All Mixtapes';
  let context: 'default' | 'related' | 'inMixtapes' | undefined = 'default';

  try {
    if (tag === 'favorites') {
      mixtapes = await getFavoritesMixtapes();
      pageTitle = 'Favorite Mixtapes';
      context = 'inMixtapes';
    } else if (tag && VALID_TAGS.includes(tag)) {
      mixtapes = await getMixtapesByTag(tag);
      pageTitle = `${slugToDisplayName(tag)} Mixtapes`;
      context = 'inMixtapes';
    } else if (tag && !VALID_TAGS.includes(tag) && tag !== 'favorites') {
      mixtapes = await getMixtapes('recent', 48);
      pageTitle = 'All Mixtapes';
    } else {
      mixtapes = await getMixtapes('recent', 48);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: tag
        ? `Curated ${tag} music collections and mixtapes`
        : 'Curated music collections and mixtapes',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/mixtapes${tag ? `?tag=${tag}` : ''}`,
      numberOfItems: mixtapes?.length || 0,
      itemListElement:
        mixtapes?.map((mixtape: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'MusicPlaylist',
            name: mixtape.title || mixtape.name,
            description: mixtape.description,
            genre: tag ? slugToDisplayName(tag) : mixtape.genre,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/mixtapes/${mixtape.slug || mixtape.id}`
          }
        })) || []
    };

    if (!mixtapes?.length) {
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd)
            }}
          />

          <MixtapeSubmenuProvider />

          <div className="container-fluid">
            <div className="row py-5">
              <div className="col-12 text-center">
                <h1 className="h2 fw-semibold mb-3">{pageTitle}</h1>
                <p className="text-muted mb-4">
                  {tag
                    ? `No ${tag} mixtapes found at the moment.`
                    : 'No mixtapes found at the moment.'}
                </p>
                {tag && (
                  <Link href="/mixtapes" className="btn btn-primary me-3">
                    Browse All Mixtapes
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />

        <MixtapeSubmenuProvider />

        {tag && (
          <div className="container-fluid d-none d-md-block">
            <div className="row py-3">
              <div className="col-12 text-center">
                <h1 className="h3 fw-semibold text-muted">{pageTitle}</h1>
              </div>
            </div>
          </div>
        )}

        <GridContainer>
          {mixtapes.map((mixtape: any, index: number) => {
            const mixtapeId = mixtape?.id || mixtape?._id;

            if (!mixtape || !mixtapeId) {
              return null;
            }

            const isFeatured = index < 6;
            const containerClass = isFeatured
              ? 'col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4'
              : 'col-6 col-sm-4 col-lg-3';

            return (
              <GridItem
                key={String(mixtapeId)}
                type="mixtape"
                id={String(mixtapeId)}
                inStock={true}
                category={mixtape.genre || (tag ? slugToDisplayName(tag) : 'mixtape')}
                className={containerClass}
              >
                <MixtapeCard
                  mixtape={mixtape}
                  variant={isFeatured ? 'featured' : 'regular'}
                  isFeatured={isFeatured}
                  priority={index < 6}
                  index={index}
                  context={context || 'default'}
                />
              </GridItem>
            );
          })}
        </GridContainer>
      </>
    );
  } catch (error) {
    return (
      <>
        <MixtapeSubmenuProvider />

        <div className="container-fluid">
          <div className="row py-5">
            <div className="col-12 text-center">
              <h1 className="h2 fw-semibold mb-3">Error Loading Mixtapes</h1>
              <p className="text-muted mb-4">Something went wrong while loading the mixtapes.</p>
              <Link href="/mixtapes" className="btn btn-primary">
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}
