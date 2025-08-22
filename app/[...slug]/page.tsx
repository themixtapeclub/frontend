import React from "react";// app/[...slug]/page.tsx

import { sanityFetchMetadata, sanityFetchPage } from 'lib/queries/sanity/core/client';
import { getPageBySlugQuery, type PageData } from 'lib/queries/sanity/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

async function getPageBySlug(slug: string): Promise<PageData | null> {
  return await sanityFetchPage<PageData>(slug, getPageBySlugQuery);
}

async function getPageMetadata(slug: string): Promise<PageData | null> {
  return await sanityFetchMetadata<PageData>(slug, getPageBySlugQuery);
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join('/');

  // Skip static files in metadata generation
  if (
    slugPath.includes('_next/') ||
    slugPath.includes('.well-known/') ||
    slugPath.includes('.js.map') ||
    slugPath.includes('favicon.ico') ||
    slugPath.includes('.css') ||
    slugPath.includes('.js')
  ) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false }
    };
  }

  const defaultMetadata: Metadata = {
    title: 'The Mixtape Club',
    description: 'Discover rare and classic vinyl records',
    other: {
      'format-detection': 'telephone=no'
    }
  };

  // Use faster metadata fetch with shorter timeout
  const page = await getPageMetadata(slugPath);

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
}

interface BlockChild {
  text: string;
  marks?: string[];
}

interface Block {
  _type: string;
  _key?: string;
  style?: string;
  children?: BlockChild[];
}

interface ImageBlock {
  _type: 'image';
  _key?: string;
  asset?: {
    url: string;
  };
  alt?: string;
  caption?: string;
}

type ContentBlock = Block | ImageBlock;

function SimpleContentRenderer({ content }: { content: ContentBlock[] }): React.JSX.Element | null {
  if (!Array.isArray(content)) return null;

  return (
    <>
      {content.map((block, index) => {
        if (!block || !block._type) return null;

        const key = block._key || `block-${index}`;

        if (block._type === 'block') {
          const style = block.style || 'normal';
          const children =
            block.children?.map((child: BlockChild, childIndex: number) => {
              if (!child.text) return null;

              let textElement: ReactNode = child.text;

              if (child.marks?.includes('strong')) {
                textElement = <strong key={`strong-${childIndex}`}>{textElement}</strong>;
              }
              if (child.marks?.includes('em')) {
                textElement = <em key={`em-${childIndex}`}>{textElement}</em>;
              }

              return <span key={`child-${childIndex}`}>{textElement}</span>;
            }) || [];

          switch (style) {
            case 'h1':
              return (
                <h1 key={key} className="mb-3 mt-4">
                  {children}
                </h1>
              );
            case 'h2':
              return (
                <h2 key={key} className="mb-3 mt-4">
                  {children}
                </h2>
              );
            case 'h3':
              return (
                <h3 key={key} className="mb-2 mt-3">
                  {children}
                </h3>
              );
            case 'h4':
              return (
                <h4 key={key} className="mb-2 mt-3">
                  {children}
                </h4>
              );
            case 'blockquote':
              return (
                <blockquote key={key} className="blockquote border-start border-primary my-4 ps-3">
                  {children}
                </blockquote>
              );
            default:
              return (
                <p key={key} className="mb-3">
                  {children}
                </p>
              );
          }
        }

        if (block._type === 'image') {
          const imageBlock = block as ImageBlock;
          return (
            <div key={key} className="my-4">
              <img
                src={imageBlock.asset?.url}
                alt={imageBlock.alt || ''}
                className="img-fluid rounded"
                loading="lazy"
              />
              {imageBlock.caption && (
                <figcaption className="figure-caption mt-2 text-center">
                  {imageBlock.caption}
                </figcaption>
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

export default async function PageComponent({
  params
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const slugPath = slug.join('/');

  // Skip static files and dev tools - return 404 immediately
  if (
    slugPath.includes('_next/') ||
    slugPath.includes('.well-known/') ||
    slugPath.includes('.js.map') ||
    slugPath.includes('favicon.ico') ||
    slugPath.includes('.css') ||
    slugPath.includes('.js') ||
    slugPath.includes('server-actions') ||
    slugPath.startsWith('static/')
  ) {
    notFound();
  }

  const page = await getPageBySlug(slugPath);

  if (!page || !page.isPublished) {
    notFound();
  }

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDescription,
    url: `https://themixtapeclub.com/${slugPath}`,
    dateModified: page.lastUpdated
  };

  return (
    <div className={`page-${slugPath.replace(/\//g, '-')}${(page as any).heroImage ? ' has-hero' : ''}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <div className="container-fluid">
        {(page as any).heroImage && (
          <div className="row">
            <div className="col-12 p-0">
              <div
                className="hero-image"
                style={{
                  minHeight: '558px',
                  backgroundImage: `url(${(page as any).heroImage.asset?.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <main className="page-content">
              {page.content && (
                <div className="fs-4">
                  <SimpleContentRenderer content={page.content} />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
