// app/shop/tag/[slug]/page.tsx
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

const tagConfig = {
  type: 'tag' as const,
  getProductsFunction: async (slug: string, page: number, sort: string) => {
    const limit = 48;
    return await getProductsByArchive('tag', slug, page, limit);
  },
  pluralName: 'Tags',
  singularName: 'Tag',
  collectionTitle: 'Tagged Collection',
  breadcrumbPath: '/shop/tags',
  basePath: '/shop/tag',
  schemaType: '@type' as const,
  bgColor: 'bg-secondary'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return generateArchiveMetadata(resolvedParams, tagConfig);
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <ArchivePage params={resolvedParams} searchParams={resolvedSearchParams} config={tagConfig} />
  );
}
