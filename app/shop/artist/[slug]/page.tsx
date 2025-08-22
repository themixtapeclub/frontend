// app/shop/artist/[slug]/page.tsx
import ArchivePage, { generateArchiveMetadata } from 'components/products/ArchivePage';
import { getProductsByArchive } from 'lib/data/products/index';
import type { Metadata } from 'next';

export const runtime = 'edge';
export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

const artistConfig = {
  type: 'artist' as const,
  getProductsFunction: async (slug: string, page: number, sort: string) => {
    const limit = 48;
    return await getProductsByArchive('artist', slug, page, limit, true);
  },
  pluralName: 'Artists',
  singularName: 'Artist',
  collectionTitle: 'Music by',
  breadcrumbPath: '/shop/artists',
  basePath: '/shop/artist',
  schemaType: '@type' as const,
  bgColor: 'bg-primary'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return generateArchiveMetadata(resolvedParams, artistConfig);
}

export default async function ArtistPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <ArchivePage
      params={resolvedParams}
      searchParams={resolvedSearchParams}
      config={artistConfig}
    />
  );
}
