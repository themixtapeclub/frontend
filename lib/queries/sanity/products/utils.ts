// lib/queries/sanity/products/utils.ts
// Utility functions for getting all artists, labels, genres, formats with consistent draft exclusion

import { sanityClient } from '../core/client';
import { BASE_PRODUCT_FILTER } from '../core/constants';
import type { FieldValue } from '../../../data/products/types';

// Get all formats with product counts
export async function getAllFormats(): Promise<FieldValue[]> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER} && defined(format)] {
      format
    }`;

    const products = await sanityClient.fetch(query);
    const formatCounts: Record<string, number> = {};

    products.forEach((product: { format?: Array<{ main?: string; sub?: string } | string> }) => {
      if (product.format && Array.isArray(product.format)) {
        product.format.forEach((formatItem) => {
          let formatName = '';

          if (typeof formatItem === 'object' && formatItem?.main) {
            formatName = formatItem.main;
          } else if (typeof formatItem === 'string') {
            formatName = formatItem;
          }

          if (formatName) {
            formatCounts[formatName] = (formatCounts[formatName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(formatCounts)
      .map(([name, count]) => ({
        value: name,
        slug: name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        count
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  } catch (error) {
    console.error('❌ Error fetching formats from Sanity:', error);
    return [];
  }
}

// Get all artists with product counts
export async function getAllArtists(): Promise<FieldValue[]> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER} && defined(artist)] {
      artist
    }`;

    const products = await sanityClient.fetch(query);
    const artistCounts: Record<string, number> = {};

    products.forEach((product: { artist?: string[] }) => {
      if (product.artist && Array.isArray(product.artist)) {
        product.artist.forEach((artist: string) => {
          if (artist) {
            artistCounts[artist] = (artistCounts[artist] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(artistCounts)
      .map(([name, count]) => ({
        value: name,
        slug: name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        count
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  } catch (error) {
    console.error('❌ Error fetching artists from Sanity:', error);
    return [];
  }
}

// Get all labels with product counts
export async function getAllLabels(): Promise<FieldValue[]> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER} && defined(label)] {
      label
    }`;

    const products = await sanityClient.fetch(query);
    const labelCounts: Record<string, number> = {};

    products.forEach((product: { label?: string[] }) => {
      if (product.label && Array.isArray(product.label)) {
        product.label.forEach((label: string) => {
          if (label) {
            labelCounts[label] = (labelCounts[label] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(labelCounts)
      .map(([name, count]) => ({
        value: name,
        slug: name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        count
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  } catch (error) {
    console.error('❌ Error fetching labels from Sanity:', error);
    return [];
  }
}

// Get all genres with product counts
export async function getAllGenres(): Promise<FieldValue[]> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER} && defined(genre)] {
      genre
    }`;

    const products = await sanityClient.fetch(query);
    const genreCounts: Record<string, number> = {};

    products.forEach((product: { genre?: Array<{ main?: string; sub?: string } | string> }) => {
      if (product.genre && Array.isArray(product.genre)) {
        product.genre.forEach((genreItem) => {
          let genreName = '';

          if (typeof genreItem === 'object' && genreItem?.main) {
            genreName = genreItem.main;
          } else if (typeof genreItem === 'string') {
            genreName = genreItem;
          }

          if (genreName) {
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(genreCounts)
      .map(([name, count]) => ({
        value: name,
        slug: name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        count
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  } catch (error) {
    console.error('❌ Error fetching genres from Sanity:', error);
    return [];
  }
}

// Test Sanity connection
export async function testSanityConnection(): Promise<number> {
  try {
    const result = await sanityClient.fetch(`count(*[${BASE_PRODUCT_FILTER}])`);
    return result;
  } catch (error) {
    console.error('❌ Sanity connection test failed:', error);
    return 0;
  }
}
