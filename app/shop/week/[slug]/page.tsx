// app/shop/week/[slug]/page.tsx
import ArchivePage, { generateArchiveMetadata } from 'components/products/ArchivePage';
import { getProductsByArchive } from 'lib/data/products/index';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

const weekConfig = {
  type: 'week' as const,
  getProductsFunction: async (slug: string, page: number, sort: string) => {
    const limit = 48;
    return await getProductsByArchive('week', slug, page, limit);
  },
  pluralName: 'Weeks',
  singularName: 'Week',
  collectionTitle: 'Weekly Collection',
  breadcrumbPath: '/shop/weeks',
  basePath: '/shop/week',
  schemaType: '@type' as const,
  bgColor: 'bg-info'
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (process.env.NODE_ENV !== 'development') {
    return {
      title: 'Not Found',
      description: 'Page not found'
    };
  }

  const resolvedParams = await params;
  return generateArchiveMetadata(resolvedParams, weekConfig);
}

export default async function WeekPage({ params, searchParams }: PageProps) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <ArchivePage params={resolvedParams} searchParams={resolvedSearchParams} config={weekConfig} />
  );
}
