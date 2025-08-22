// app/shop/format/[slug]/page.tsx
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

const formatConfig = {
  type: 'format' as const,
  getProductsFunction: async (slug: string, page: number, sort: string) => {
    const limit = 48;
    return await getProductsByArchive('format', slug, page, limit);
  },
  pluralName: 'Formats',
  singularName: 'Format',
  collectionTitle: 'Format Collection',
  breadcrumbPath: '/shop/formats',
  basePath: '/shop/format',
  schemaType: '@type' as const,
  bgColor: 'bg-success'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return generateArchiveMetadata(resolvedParams, formatConfig);
}

export default async function FormatPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <ArchivePage
      params={resolvedParams}
      searchParams={resolvedSearchParams}
      config={formatConfig}
    />
  );
}
