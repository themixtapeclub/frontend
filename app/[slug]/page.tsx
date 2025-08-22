// app/[slug]/page.tsx

import { sanityFetch } from 'lib/queries/sanity';
import { getPageBySlugQuery, type PageData } from 'lib/queries/sanity/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function getPageBySlug(slug: string): Promise<PageData | null> {
  try {
    const page = await sanityFetch<PageData>(getPageBySlugQuery, { slug });
    return page;
  } catch {
    return null;
  }
}

async function getPageDataWithRetry(slug: string, maxAttempts: number = 3): Promise<any> {
  const baseDelay = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await getPageBySlug(slug);

      if (result) {
        return result;
      }
    } catch {
      const isLastAttempt = attempt === maxAttempts - 1;
      if (isLastAttempt) {
        throw new Error('All attempts failed');
      }
      const delay = baseDelay * (attempt + 1) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
}

const fallbackCache = new Map<string, any>();
const FALLBACK_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getPageDataWithFallback(slug: string): Promise<any> {
  try {
    const data = await getPageDataWithRetry(slug);

    if (data) {
      fallbackCache.set(slug, {
        data,
        timestamp: Date.now()
      });
      return data;
    }
  } catch {
    const cached = fallbackCache.get(slug);
    if (cached && Date.now() - cached.timestamp < FALLBACK_CACHE_TTL) {
      return cached.data;
    }
    throw new Error('No fallback available');
  }

  return null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const defaultMetadata: Metadata = {
    title: 'The Mixtape Club',
    description: 'Discover rare and classic vinyl records',
    other: {
      'format-detection': 'telephone=no'
    }
  };

  try {
    const page = await Promise.race([
      getPageDataWithFallback(slug),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]);

    if (!page) {
      return defaultMetadata;
    }

    const title = page.title || 'Page';
    const description = page.metaDescription || `${title} - The Mixtape Club`;

    return {
      title: `${title} - The Mixtape Club`,
      description: description.slice(0, 160),
      other: {
        'format-detection': 'telephone=no'
      }
    };
  } catch {
    return defaultMetadata;
  }
}

function SimpleContentRenderer({ content }: { content: any[] }) {
  if (!Array.isArray(content)) return null;

  return (
    <>
      {content.map((block, index) => {
        if (!block || !block._type) return null;

        if (block._type === 'block') {
          const style = block.style || 'normal';
          const children = block.children?.map((child: any, childIndex: number) => {
            if (!child.text) return null;

            let text = child.text;

            if (child.marks?.includes('strong')) {
              text = <strong key={childIndex}>{text}</strong>;
            }
            if (child.marks?.includes('em')) {
              text = <em key={childIndex}>{text}</em>;
            }

            return <span key={childIndex}>{text}</span>;
          });

          switch (style) {
            case 'h1':
              return (
                <h1 key={index} className="mb-3 mt-4">
                  {children}
                </h1>
              );
            case 'h2':
              return (
                <h2 key={index} className="mb-3 mt-4">
                  {children}
                </h2>
              );
            case 'h3':
              return (
                <h3 key={index} className="mb-2 mt-3">
                  {children}
                </h3>
              );
            case 'h4':
              return (
                <h4 key={index} className="mb-2 mt-3">
                  {children}
                </h4>
              );
            case 'blockquote':
              return (
                <blockquote
                  key={index}
                  className="blockquote border-start border-primary my-4 ps-3"
                >
                  {children}
                </blockquote>
              );
            default:
              return (
                <p key={index} className="mb-3">
                  {children}
                </p>
              );
          }
        }

        if (block._type === 'image') {
          return (
            <div key={index} className="my-4">
              <img
                src={block.asset?.url}
                alt={block.alt || ''}
                className="img-fluid rounded"
                loading="lazy"
              />
              {block.caption && (
                <figcaption className="figure-caption mt-2 text-center">{block.caption}</figcaption>
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

export default async function PageComponent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let page: any = null;

  try {
    page = await getPageDataWithFallback(slug);
  } catch {}

  if (!page || !page.isPublished) {
    notFound();
  }

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://themixtapeclub.com/${slug}`,
    dateModified: page.lastUpdated
  };

  return (
    <div className={`page-${slug}${page.heroImage ? ' has-hero' : ''}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <div className="container-fluid">
        <PageContentOptimized page={page} slug={slug} />
      </div>
    </div>
  );
}

function PageContentOptimized({ page, slug }: { page: any; slug: string }) {
  try {
    return (
      <>
        {page.heroImage && (
          <div className="row">
            <div className="col-12 p-0">
              <div
                className="hero-image"
                style={{
                  minHeight: '558px',
                  backgroundImage: `url(${page.heroImage.asset?.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <main className="page-content py-4">
              {page.content && (
                <div className="fs-4">
                  <SimpleContentRenderer content={page.content} />
                </div>
              )}
            </main>
          </div>
        </div>
      </>
    );
  } catch {
    return (
      <div className="row">
        <div className="col-12">
          <div className="py-4">
            <div className="alert alert-warning">
              <h1>{page?.title || 'Page'}</h1>
              <p>Unable to load full page content</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
