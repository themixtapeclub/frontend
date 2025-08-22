// lib/data/products/utils/filters.ts
import { sanityClient } from '../../../cms';
import { slugToLabelName } from './extractors';

export async function getGenreFilterCondition(slug: string): Promise<string> {
  const submenuQuery = `*[_type == "submenuItem" && slug.current == "${slug}"][0]{
    slug,
    label,
    relatedGenres,
    relatedRegions
  }`;

  const submenuItem = await sanityClient.fetch(submenuQuery);

  if (submenuItem && submenuItem.relatedGenres && submenuItem.relatedGenres.length > 0) {
    const mainGenreName = submenuItem.label;
    const relatedGenres = submenuItem.relatedGenres;

    const mainGenreConditions = [
      `"${slug}" in genre[].main`,
      `"${slug.toLowerCase()}" in genre[].main`,
      `"${slug.toUpperCase()}" in genre[].main`,
      `"${mainGenreName}" in genre[].main`,
      `"${mainGenreName.toLowerCase()}" in genre[].main`,
      `"${mainGenreName.toUpperCase()}" in genre[].main`,
      `genre[].main == "${mainGenreName}"`,
      `genre[].main == "${mainGenreName.toLowerCase()}"`,
      `genre[].main == "${mainGenreName.toUpperCase()}"`
    ];

    const relatedConditions = relatedGenres.flatMap((genre: string) => [
      `"${genre}" in genre[].main`,
      `"${genre.toLowerCase()}" in genre[].main`,
      `"${genre.toUpperCase()}" in genre[].main`,
      `genre[].main == "${genre}"`,
      `genre[].main == "${genre.toLowerCase()}"`,
      `genre[].main == "${genre.toUpperCase()}"`
    ]);

    return [...mainGenreConditions, ...relatedConditions].join(' || ');
  } else {
    const genreName = slugToLabelName(slug);
    const lowerSlug = slug.toLowerCase();
    const upperSlug = slug.toUpperCase();
    const titleSlug = genreName;

    return [
      `"${lowerSlug}" in genre[].main`,
      `"${upperSlug}" in genre[].main`,
      `"${titleSlug}" in genre[].main`,
      `genre[].main == "${titleSlug}"`,
      `genre[].main == "${titleSlug.toLowerCase()}"`,
      `genre[].main == "${titleSlug.toUpperCase()}"`
    ].join(' || ');
  }
}

export function createArchiveFilterCondition(
  archiveType: 'artist' | 'label' | 'genre' | 'format' | 'week' | 'tag',
  slug: string,
  genreFilterCondition?: string
): string | Promise<string> {
  switch (archiveType) {
    case 'artist':
      const artistName = slugToLabelName(slug);

      const artistVariations = [
        slug,
        artistName,
        slug.replace(/-/g, ' '),
        slug.replace(/--+/g, ' & ')
      ];

      const uniqueArtistVariations = [...new Set(artistVariations)];

      const artistConditions = uniqueArtistVariations.flatMap((variation) => [
        `"${variation}" in artist[]`,
        `"${variation.toLowerCase()}" in artist[]`,
        `"${variation.toUpperCase()}" in artist[]`,
        `artist[] match "*${variation}*"`,
        `artist[] match "*${variation.toLowerCase()}*"`,
        `artist[] match "*${variation.toUpperCase()}*"`,
        `lower(artist[]) match "*${variation.toLowerCase()}*"`
      ]);

      return artistConditions.join(' || ');

    case 'label':
      const labelName = slugToLabelName(slug);

      const variations = [slug, labelName, slug.replace(/-/g, ' '), slug.replace(/--+/g, ' & ')];

      const uniqueVariations = [...new Set(variations)];

      const conditions = uniqueVariations.flatMap((variation) => [
        `"${variation}" in label[]`,
        `"${variation.toLowerCase()}" in label[]`,
        `"${variation.toUpperCase()}" in label[]`,
        `label[] match "*${variation}*"`,
        `label[] match "*${variation.toLowerCase()}*"`,
        `label[] match "*${variation.toUpperCase()}*"`,
        `"${variation}" in label[].main`,
        `"${variation.toLowerCase()}" in label[].main`,
        `"${variation.toUpperCase()}" in label[].main`,
        `lower(label[]) match "*${variation.toLowerCase()}*"`,
        `lower(label[].main) match "*${variation.toLowerCase()}*"`
      ]);

      return conditions.join(' || ');

    case 'genre':
      return genreFilterCondition || getGenreFilterCondition(slug);

    case 'format':
      const formatName = slugToLabelName(slug);
      const upperSlug = slug.toUpperCase();
      const upperFormatName = formatName.toUpperCase();
      const titleCase = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
      const titleFormatName =
        formatName.charAt(0).toUpperCase() + formatName.slice(1).toLowerCase();

      // Special handling for vinyl formats based on actual data
      const vinylVariations = [];
      if (slug === '7' || slug === '7-inch' || formatName.includes('7')) {
        vinylVariations.push('format[].main == "7\\""', '"7\\"" in format[].main');
      }
      if (slug === '12' || slug === '12-inch' || formatName.includes('12')) {
        vinylVariations.push('format[].main == "12\\""', '"12\\"" in format[].main');
      }

      const standardConditions = [
        `"${upperSlug}" in format[].main`,
        `"${upperFormatName}" in format[].main`,
        `"${slug}" in format[].main`,
        `"${formatName}" in format[].main`,
        `"${slug.toLowerCase()}" in format[].main`,
        `"${formatName.toLowerCase()}" in format[].main`,
        `"${titleCase}" in format[].main`,
        `"${titleFormatName}" in format[].main`,
        `format[].main == "${upperSlug}"`,
        `format[].main == "${upperFormatName}"`,
        `format[].main == "${slug}"`,
        `format[].main == "${formatName}"`,
        `format[].main == "${titleCase}"`,
        `format[].main == "${titleFormatName}"`
      ];

      const allConditions = [...standardConditions, ...vinylVariations];
      return allConditions.join(' || ');

    case 'week':
      return `"${slug}" in week[]`;

    case 'tag':
      const tagName = slugToLabelName(slug);
      return `"${slug}" in tags[] || "${tagName}" in tags[]`;

    default:
      const defaultName = slugToLabelName(slug);
      return `"${slug}" in tags[] || "${defaultName}" in tags[]`;
  }
}
