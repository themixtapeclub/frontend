// app/api/update-tracklist/route.js
import { createClient } from '@sanity/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { invalidateProductDataCache } from '../../../lib/services/optimizedProduct';

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fetchDiscogsTrackData(discogsReleaseId) {
  if (!discogsReleaseId) return null;

  try {
    const discogsToken = process.env.DISCOGS_TOKEN;
    const headers = {
      'User-Agent': 'TheMixtapeClub/1.0 +https://themixtapeclub.com'
    };

    if (discogsToken) {
      headers['Authorization'] = `Discogs token=${discogsToken}`;
    }

    const response = await fetch(`https://api.discogs.com/releases/${discogsReleaseId}`, {
      headers
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.tracklist || null;
  } catch (error) {
    return null;
  }
}

function extractTitleFromDiscogsTrack(discogsTrack) {
  if (!discogsTrack) return null;

  const title = discogsTrack.title;
  if (!title || !title.trim()) return null;


  const normalizedTitle = title.toLowerCase().trim();


  if (/^Track \d+$/i.test(title)) {
    return null;
  }

  return title.trim();
}

function extractArtistFromDiscogsTrack(discogsTrack) {
  if (!discogsTrack) {
    return null;
  }

  if (discogsTrack.artists && discogsTrack.artists.length > 0) {
    const rawArtistName = discogsTrack.artists[0].name;
    const cleanArtistName = rawArtistName.replace(/\s*\(\d+\)$/, '');
    return cleanArtistName;
  }

  if (discogsTrack.extraartists && discogsTrack.extraartists.length > 0) {
    const mainArtist = discogsTrack.extraartists.find(
      (artist) =>
        !artist.role ||
        artist.role.toLowerCase().includes('performer') ||
        artist.role.toLowerCase().includes('vocals') ||
        artist.role.toLowerCase().includes('artist') ||
        artist.role.toLowerCase().includes('producer')
    );

    if (mainArtist) {
      const rawArtistName = mainArtist.name;
      const cleanArtistName = rawArtistName.replace(/\s*\(\d+\)$/, '');
      return cleanArtistName;
    }

    const rawArtistName = discogsTrack.extraartists[0].name;
    const cleanArtistName = rawArtistName.replace(/\s*\(\d+\)$/, '');
    return cleanArtistName;
  }

  return null;
}

async function enhanceTracklistComprehensively(tracklist, productInfo, enhancementRequest = {}) {
  const { enhanceTitles = true, enhanceArtists = true } = enhancementRequest;

  if (!productInfo.discogsReleaseId) {
    return {
      tracklist,
      titleEnhancementsApplied: false,
      artistEnhancementsApplied: false
    };
  }

  const discogsTracklist = await fetchDiscogsTrackData(productInfo.discogsReleaseId);
  if (!discogsTracklist) {
    return {
      tracklist,
      titleEnhancementsApplied: false,
      artistEnhancementsApplied: false
    };
  }

  const actualTracks = discogsTracklist.filter(
    (track) => track.type_ === 'track' && track.position && track.title
  );

  const isVariousArtist =
    productInfo.artist && productInfo.artist.some((a) => a.toLowerCase() === 'various');

  let titleEnhancementsCount = 0;
  let artistEnhancementsCount = 0;

  const enhancedTracklist = tracklist.map((track, index) => {
    let enhancedTrack = { ...track };
    let trackModified = false;

    const discogsTrack = actualTracks[index];
    if (!discogsTrack) {
      return enhancedTrack;
    }

    if (enhanceTitles) {
      const hasDefaultTitle = /^Track \d+$/i.test(track.title || '');

      if (hasDefaultTitle) {
        const discogsTitle = discogsTrack.title;
        if (discogsTitle && discogsTitle.trim()) {
          enhancedTrack.title = discogsTitle.trim();
          titleEnhancementsCount++;
          trackModified = true;
        }
      }
    }

    if (enhanceArtists && isVariousArtist) {
      const needsArtistEnhancement =
        !track.artist || track.artist.trim() === '' || track.artist.trim() === 'Various';

      if (needsArtistEnhancement) {
        const discogsArtist = extractArtistFromDiscogsTrack(discogsTrack);
        if (discogsArtist) {
          enhancedTrack.artist = discogsArtist;
          artistEnhancementsCount++;
          trackModified = true;
        }
      }
    }

    return enhancedTrack;
  });

  return {
    tracklist: enhancedTracklist,
    titleEnhancementsApplied: titleEnhancementsCount > 0,
    artistEnhancementsApplied: artistEnhancementsCount > 0
  };
}

export async function POST(request) {
  try {
    const { documentId, tracklist, enhancementRequest } = await request.json();

    if (!documentId || !tracklist) {
      return Response.json(
        { error: 'Missing required fields: documentId and tracklist' },
        { status: 400 }
      );
    }

    if (!Array.isArray(tracklist)) {
      return Response.json({ error: 'tracklist must be an array' }, { status: 400 });
    }

    if (!process.env.SANITY_API_TOKEN) {
      return Response.json({ error: 'Sanity API token not configured' }, { status: 500 });
    }

    const productInfo = await sanityClient.fetch(
      `*[_id == $documentId][0] {
        _id,
        title,
        artist,
        discogsReleaseId,
        swellProductId,
        swellSlug,
        slug
      }`,
      { documentId }
    );

    if (!productInfo) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const enhancementResult = await enhanceTracklistComprehensively(
      tracklist,
      productInfo,
      enhancementRequest
    );

    const {
      tracklist: enhancedTracklist,
      titleEnhancementsApplied,
      artistEnhancementsApplied
    } = enhancementResult;

    const result = await sanityClient
      .patch(documentId)
      .set({
        tracklist: enhancedTracklist,
        tracklistEnhanced: true,
        tracklistLastUpdated: new Date().toISOString(),
        titleEnhancementsApplied,
        artistEnhancementsApplied
      })
      .commit();

    try {
      revalidateTag('products');
      revalidateTag(`product-${documentId}`);
      revalidateTag(`product-${productInfo.swellProductId}`);

      const productSlug = productInfo.swellSlug || productInfo.slug?.current || productInfo.slug;
      if (productSlug) {
        revalidatePath(`/product/${productSlug}`);
        revalidatePath(`/products/${productSlug}`);

        invalidateProductDataCache(productSlug);
      }

      revalidateTag('related-products');
      revalidateTag(`related-${productInfo.swellProductId}`);
    } catch (revalidationError) {}

    const broadcastData = {
      type: 'enhancedTracklistUpdate',
      documentId,
      swellProductId: productInfo.swellProductId,
      productSlug: productInfo.swellSlug || productInfo.slug?.current || productInfo.slug,
      tracklist: enhancedTracklist,
      enhancementTypes: {
        titles: titleEnhancementsApplied,
        artists: artistEnhancementsApplied
      },
      timestamp: Date.now()
    };

    return Response.json({
      success: true,
      documentId: result._id,
      revision: result._rev,
      tracklist: enhancedTracklist,
      titleEnhancementsApplied,
      artistEnhancementsApplied,
      productSlug: productInfo.swellSlug || productInfo.slug?.current || productInfo.slug,
      message: `Tracklist updated successfully${
        titleEnhancementsApplied ? ' with title enhancements' : ''
      }${artistEnhancementsApplied ? ' with artist enhancements' : ''}`,
      broadcast: broadcastData
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message || 'Internal server error',
        details: error.details || null
      },
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const testDiscogs = searchParams.get('testDiscogs');
  const releaseId = searchParams.get('releaseId');

  if (testDiscogs && releaseId) {
    try {
      const discogsToken = process.env.DISCOGS_TOKEN;
      const headers = {
        'User-Agent': 'TheMixtapeClub/1.0 +https://themixtapeclub.com'
      };

      if (discogsToken) {
        headers['Authorization'] = `Discogs token=${discogsToken}`;
      }

      const response = await fetch(`https://api.discogs.com/releases/${releaseId}`, { headers });

      if (!response.ok) {
        return Response.json({
          error: `Discogs API failed: ${response.status} ${response.statusText}`,
          status: response.status,
          rateLimitRemaining: response.headers.get('X-Discogs-Ratelimit-Remaining'),
          rateLimitUsed: response.headers.get('X-Discogs-Ratelimit-Used')
        });
      }

      const data = await response.json();
      const tracklist = data.tracklist || [];

      return Response.json({
        success: true,
        discogsTitle: data.title,
        trackCount: tracklist.length,
        enhancementAnalysis: {
          titlesAvailable: tracklist.filter((t) => t.title && !/^Track \d+$/i.test(t.title)).length,
          artistsAvailable: tracklist.filter((t) => t.artists && t.artists.length > 0).length,
          extraArtistsAvailable: tracklist.filter(
            (t) => t.extraartists && t.extraartists.length > 0
          ).length
        },
        sampleTracks: tracklist.slice(0, 3).map((track) => ({
          position: track.position,
          title: track.title,
          artists: track.artists?.map((a) => a.name) || [],
          extraartists: track.extraartists?.map((a) => ({ name: a.name, role: a.role })) || [],
          enhancementPotential: {
            hasEnhancedTitle: track.title && !/^Track \d+$/i.test(track.title),
            hasDirectArtist: !!(track.artists && track.artists.length > 0),
            hasExtraArtist: !!(track.extraartists && track.extraartists.length > 0)
          }
        })),
        fullTracklist: tracklist
      });
    } catch (error) {
      return Response.json({
        error: `Enhanced Discogs fetch error: ${error.message}`,
        details: error.stack
      });
    }
  }

  return Response.json({
    message: 'Enhanced tracklist update API with comprehensive title and artist support',
    timestamp: new Date().toISOString(),
    features: [
      'Title enhancement (Track 1 -> real title)',
      'Artist enhancement for Various Artists releases',
      'Discogs integration with rate limiting',
      'Real-time cache invalidation',
      'Broadcast events for UI updates'
    ],
    environment: {
      hasProjectId: !!(process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
      hasDataset: !!(process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET),
      hasToken: !!process.env.SANITY_API_TOKEN,
      hasDiscogsToken: !!process.env.DISCOGS_TOKEN
    },
    usage: {
      testDiscogs:
        'Add ?testDiscogs=true&releaseId=XXXXX to test Discogs API with enhancement analysis'
    }
  });
}
