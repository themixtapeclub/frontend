// app/mixtapes/[tag]/page.tsx
import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import MixtapeSubmenuProvider from 'components/layout/header/mixtapeSubmenuProvider';
import MixtapeCard from 'components/mixtapes/MixtapeCard';
import { getFavoritesMixtapes, getMixtapesByTag } from 'lib/data/mixtapes';
import { slugToDisplayName } from 'lib/utils/slug';
import type { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'nodejs';
export const revalidate = 1800;

// Generate static params for menu mixtape tags
export async function generateStaticParams() {
  // All the mixtape tags from your menu
  const menuTags = ['groovy', 'chill', 'global', 'healing', 'dance', 'nostalgia'];

  console.log(`🎧 Generating static params for ${menuTags.length} menu mixtape tags`);

  return menuTags.map((tag) => ({ tag }));
}
interface MixtapeTagPageProps {
  params: Promise<{
    tag: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: MixtapeTagPageProps): Promise<Metadata> {
  const { tag } = await params;

  if (tag === 'favorites') {
    return {
      title: 'Favorite Mixtapes - Curated Music Collections',
      description: 'Our favorite mixtapes and curated music collections. The best of the best.',
      robots: { index: true, follow: true }
    };
  }

  const displayName = slugToDisplayName(tag);
  return {
    title: `${displayName} Mixtapes - Curated Music Collections`,
    description: `Discover ${displayName.toLowerCase()} mixtapes. Curated collections of music that capture the ${displayName.toLowerCase()} vibe.`,
    robots: { index: true, follow: true }
  };
}

export default async function MixtapeTagPage({ params, searchParams }: MixtapeTagPageProps) {
  const { tag } = await params;
  const { sort } = await searchParams;

  let mixtapes: any[] = [];
  let pageTitle = 'All Mixtapes';
  let context: 'default' | 'related' | 'inMixtapes' | undefined = 'inMixtapes';

  try {
    if (tag === 'favorites') {
      mixtapes = await getFavoritesMixtapes();
      pageTitle = 'Favorite Mixtapes';
    } else {
      mixtapes = await getMixtapesByTag(tag);
      pageTitle = `${slugToDisplayName(tag)} Mixtapes`;
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: `Curated ${tag} music collections and mixtapes`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/mixtapes/${tag}`,
      numberOfItems: mixtapes?.length || 0,
      itemListElement:
        mixtapes?.map((mixtape: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'MusicPlaylist',
            name: mixtape.title || mixtape.name,
            description: mixtape.description,
            genre: slugToDisplayName(tag),
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
                <p className="text-muted mb-4">No {tag} mixtapes found at the moment.</p>
                <Link href="/mixtapes" className="btn btn-primary me-3">
                  Browse All Mixtapes
                </Link>
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
                category={mixtape.genre || slugToDisplayName(tag)}
                className={containerClass}
              >
                <MixtapeCard
                  mixtape={mixtape}
                  variant={isFeatured ? 'featured' : 'regular'}
                  isFeatured={isFeatured}
                  priority={index < 6}
                  index={index}
                  context={context}
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
              <p className="text-muted mb-4">
                Something went wrong while loading the {tag} mixtapes.
              </p>
              <Link href="/mixtapes" className="btn btn-primary">
                Browse All Mixtapes
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}
