// components/product/productComponents.tsx
'use client';

import Link from 'next/link';
import { useSanityProduct } from '../../contexts/SanityProductContext';

const getSanityArrayItems = (
  content: any,
  fieldPaths: string[]
): Array<{ name: string; slug?: string }> => {
  if (!content) return [];

  for (const path of fieldPaths) {
    const keys = path.split('.');
    let value: any = content;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    if (value) {
      if (Array.isArray(value)) {
        const items: Array<{ name: string; slug?: string }> = [];

        value.forEach((item: any) => {
          let name = '';
          let slug = '';

          if (typeof item === 'string') {
            if (item.includes(',')) {
              const splitLabels = item
                .split(',')
                .map((label: string) => label.trim())
                .filter(Boolean);
              splitLabels.forEach((labelName: string) => {
                items.push({ name: labelName, slug: '' });
              });
              return;
            } else {
              name = item;
            }
          } else if (item?.name) {
            name = item.name;
            if (item.slug?.current) {
              slug = item.slug.current;
            }
          } else if (item?.title) {
            name = item.title;
            if (item.slug?.current) {
              slug = item.slug.current;
            }
          } else if (item?.main) {
            name = item.main;
          }

          if (name) {
            items.push({ name, slug });
          }
        });

        return items.filter((item: any) => item.name);
      }

      if (typeof value === 'string') {
        if (value.includes(',')) {
          const splitLabels = value
            .split(',')
            .map((label: string) => label.trim())
            .filter(Boolean);
          return splitLabels.map((labelName: string) => ({ name: labelName, slug: '' }));
        }
        return [{ name: value, slug: '' }];
      }

      if (typeof value === 'object' && (value.name || value.title || value.main)) {
        return [
          {
            name: value.name || value.title || value.main,
            slug: value.slug?.current || ''
          }
        ];
      }
    }
  }

  return [];
};

function createSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const getSanityFieldValue = (content: any, fieldPaths: string[]): string | null => {
  if (!content) return null;

  for (const path of fieldPaths) {
    const keys = path.split('.');
    let value: any = content;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    if (value) {
      if (typeof value === 'string') {
        return value;
      }

      if (typeof value === 'object' && (value.name || value.title || value.main)) {
        return value.name || value.title || value.main;
      }

      if (Array.isArray(value)) {
        return value
          .map((item: any) => {
            if (typeof item === 'string') return item;
            if (item?.name) return item.name;
            if (item?.title) return item.title;
            if (item?.main) return item.main;

            if (item?._type === 'object' && (item?.main || item?.sub)) {
              const parts = [];
              if (item.main) parts.push(item.main);
              if (item.sub) parts.push(item.sub);
              return parts.join(' - ');
            }

            if (item?.main || item?.sub) {
              const parts = [];
              if (item.main) parts.push(item.main);
              if (item.sub) parts.push(item.sub);
              return parts.join(' - ');
            }

            return String(item);
          })
          .filter(Boolean)
          .join(', ');
      }

      if (value instanceof Date) {
        return value.getFullYear().toString();
      }

      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return new Date(value).getFullYear().toString();
      }

      if (typeof value !== 'object') {
        return String(value);
      }
    }
  }

  return null;
};

const shouldDisableArtistLink = (artistName: string): boolean => {
  const normalizedName = artistName.toLowerCase().trim();
  return normalizedName === 'various' || normalizedName === 'unknown';
};

const shouldDisableLabelLink = (labelName: string): boolean => {
  const normalizedName = labelName.toLowerCase().trim();
  return normalizedName === 'not on label';
};

export function Artist({ linkToArchive = false }: { linkToArchive?: boolean }) {
  const { content } = useSanityProduct();

  if (linkToArchive) {
    const artists = getSanityArrayItems(content, ['artist']);

    if (artists.length === 0) {
      return <span>Unknown Artist</span>;
    }

    if (artists.length === 1) {
      const artist = artists[0];
      const shouldDisable = shouldDisableArtistLink(artist.name);

      if (shouldDisable) {
        return <span className="me-3 bg-white">{artist.name}</span>;
      }

      const slug = artist.slug || createSlug(artist.name);
      return (
        <Link
          href={`/shop/artist/${slug}`}
          className="artist-link text-decoration-none me-3 bg-white"
        >
          {artist.name}
        </Link>
      );
    }

    return (
      <span className="me-3">
        {artists.map((artist, index) => {
          const shouldDisable = shouldDisableArtistLink(artist.name);

          return (
            <span key={index}>
              {shouldDisable ? (
                <span className="bg-white">{artist.name}</span>
              ) : (
                <Link
                  href={`/shop/artist/${artist.slug || createSlug(artist.name)}`}
                  className="artist-link text-decoration-none bg-white"
                >
                  {artist.name}
                </Link>
              )}
              {index < artists.length - 1 && ', '}
            </span>
          );
        })}
      </span>
    );
  }

  const artistName = getSanityFieldValue(content, ['artist']) || 'Unknown Artist';
  return <span>{artistName}</span>;
}

export function Label({ linkToArchive = false }: { linkToArchive?: boolean }) {
  const { content } = useSanityProduct();

  if (linkToArchive) {
    const labels = getSanityArrayItems(content, ['label']);

    if (labels.length === 0) {
      return <span>Unknown Label</span>;
    }

    return (
      <span>
        {labels.map((label, index) => {
          const shouldDisable = shouldDisableLabelLink(label.name);

          return (
            <span key={`${label.slug || createSlug(label.name)}-${index}`}>
              {shouldDisable ? (
                <span>{label.name}</span>
              ) : (
                <Link
                  href={`/shop/label/${label.slug || createSlug(label.name)}`}
                  className="label-link text-decoration-none"
                >
                  {label.name}
                </Link>
              )}
              {index < labels.length - 1 && ', '}
            </span>
          );
        })}
      </span>
    );
  }

  const labels = getSanityArrayItems(content, ['label']);
  if (labels.length > 0) {
    return <span>{labels.map((label) => label.name).join(', ')}</span>;
  }

  return <span>Unknown Label</span>;
}

export function Catalog() {
  const { content } = useSanityProduct();
  const catalogNumber = getSanityFieldValue(content, ['catalog']);

  if (!catalogNumber) return null;

  return <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{catalogNumber}</div>;
}

export function Format() {
  const { content } = useSanityProduct();

  if (!content?.format || !Array.isArray(content.format) || content.format.length === 0) {
    return null;
  }

  const formatStrings = content.format
    .map((formatItem: any) => {
      if (typeof formatItem === 'string') {
        return formatItem;
      }

      if (typeof formatItem === 'object') {
        const parts = [];
        if (formatItem.main) parts.push(formatItem.main);
        if (formatItem.sub) parts.push(formatItem.sub);
        return parts.join(' - ');
      }

      return String(formatItem);
    })
    .filter(Boolean);

  if (formatStrings.length === 0) return null;

  return (
    <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
      {formatStrings.join(', ')}
    </div>
  );
}

export function Released() {
  const { content } = useSanityProduct();
  const releasedYear = getSanityFieldValue(content, ['released']);

  if (!releasedYear) return null;

  return <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{releasedYear}</div>;
}

export function Country() {
  const { content } = useSanityProduct();
  const countryName = getSanityFieldValue(content, ['country']);

  if (!countryName) return null;

  return <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{countryName}</div>;
}

export function Genre() {
  const { content } = useSanityProduct();

  if (!content?.genre || !Array.isArray(content.genre) || content.genre.length === 0) {
    return null;
  }

  const genreItems: Array<{ display: string; slug: string }> = [];

  content.genre.forEach((genreItem: any) => {
    if (typeof genreItem === 'string') {
      genreItems.push({
        display: genreItem,
        slug: createSlug(genreItem)
      });
    } else if (typeof genreItem === 'object' && genreItem !== null) {
      if (genreItem.name) {
        genreItems.push({
          display: genreItem.name,
          slug: genreItem.slug?.current || createSlug(genreItem.name)
        });
      } else if (genreItem.title) {
        genreItems.push({
          display: genreItem.title,
          slug: genreItem.slug?.current || createSlug(genreItem.title)
        });
      } else {
        if (genreItem.main && genreItem.main.trim() !== '') {
          if (genreItem.main.includes(',')) {
            const splitGenres = genreItem.main
              .split(',')
              .map((g: string) => g.trim())
              .filter((g: string) => g !== '');
            splitGenres.forEach((genre: string) => {
              genreItems.push({
                display: genre,
                slug: createSlug(genre)
              });
            });
          } else {
            genreItems.push({
              display: genreItem.main,
              slug: createSlug(genreItem.main)
            });
          }
        }
        if (genreItem.sub && genreItem.sub.trim() !== '') {
          if (genreItem.sub.includes(',')) {
            const splitGenres = genreItem.sub
              .split(',')
              .map((g: string) => g.trim())
              .filter((g: string) => g !== '');
            splitGenres.forEach((genre: string) => {
              genreItems.push({
                display: genre,
                slug: createSlug(genre)
              });
            });
          } else {
            genreItems.push({
              display: genreItem.sub,
              slug: createSlug(genreItem.sub)
            });
          }
        }
      }
    } else {
      const display = String(genreItem);
      genreItems.push({
        display,
        slug: createSlug(display)
      });
    }
  });

  const uniqueGenreItems = genreItems
    .filter((item) => item.display && item.display.trim() !== '')
    .filter((item, index, self) => index === self.findIndex((t) => t.slug === item.slug));

  if (uniqueGenreItems.length === 0) return null;

  return (
    <div className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
      {uniqueGenreItems.map((item, index) => (
        <span key={`${item.slug}-${index}`}>
          <Link
            href={`/shop/genre/${item.slug}`}
            className="transition-colors hover:text-neutral-800 hover:underline dark:hover:text-neutral-200"
          >
            {item.display}
          </Link>
          {index < uniqueGenreItems.length - 1 && ', '}
        </span>
      ))}
    </div>
  );
}
