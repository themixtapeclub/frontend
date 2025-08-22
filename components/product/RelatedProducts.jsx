// components/product/RelatedProducts.jsx
'use client';

import { useState } from 'react';
import { GridContainer } from '../grid/Container';
import { GridItem } from '../grid/Item';
import ProductCard from '../products/ProductCard';

export default function RelatedProducts({
  relatedProducts = { artistLabelProducts: [], tagBasedProducts: [] },
  currentProduct = 'Unknown',
  isLoading = false
}) {
  const [showDebug, setShowDebug] = useState(false);

  const { artistLabelProducts = [], tagBasedProducts = [] } = relatedProducts;
  const totalProducts = artistLabelProducts.length + tagBasedProducts.length;

  if (isLoading || totalProducts === 0) {
    return null;
  }

  const shouldConsolidate = artistLabelProducts.length <= 1;

  let finalArtistLabelProducts = [];
  let finalTagBasedProducts = [];

  if (shouldConsolidate) {
    finalArtistLabelProducts = [];
    finalTagBasedProducts = [
      ...artistLabelProducts.map((product) => ({
        ...product,
        originalCategory: 'artistLabel'
      })),
      ...tagBasedProducts
    ];
  } else {
    finalArtistLabelProducts = artistLabelProducts;
    finalTagBasedProducts = tagBasedProducts;
  }

  const getArtistLabelTitle = (displayedProducts) => {
    if (!displayedProducts || displayedProducts.length === 0) return null;

    const artistMatches = new Set();
    const labelMatches = new Set();

    displayedProducts.forEach((product) => {
      if (product.validArtists && product.validArtists.length > 0) {
        const productArtists = Array.isArray(product.sanityContent?.artist)
          ? product.sanityContent.artist
          : [product.sanityContent?.artist];

        productArtists.forEach((artist) => {
          const artistName = typeof artist === 'string' ? artist : artist?.main || artist?.name;
          if (artistName && product.validArtists.includes(artistName.trim())) {
            artistMatches.add(artistName.trim());
          }
        });
      }

      if (product.validLabels && product.validLabels.length > 0) {
        const productLabels = Array.isArray(product.sanityContent?.label)
          ? product.sanityContent.label
          : [product.sanityContent?.label];

        productLabels.forEach((label) => {
          const labelName = typeof label === 'string' ? label : label?.main || label?.name;
          if (labelName && product.validLabels.includes(labelName.trim())) {
            labelMatches.add(labelName.trim());
          }
        });
      }
    });

    const hasArtistMatches = artistMatches.size > 0;
    const hasLabelMatches = labelMatches.size > 0;

    if (hasArtistMatches && hasLabelMatches) {
      const artistList = Array.from(artistMatches);
      const labelList = Array.from(labelMatches);

      const artistPart =
        artistList.length === 1
          ? artistList[0]
          : artistList.length === 2
            ? artistList.join(' & ')
            : `${artistList[0]} & Others`;

      const labelPart =
        labelList.length === 1
          ? labelList[0]
          : labelList.length === 2
            ? labelList.join(' & ')
            : `${labelList[0]} & Others`;

      return `More by ${artistPart} & ${labelPart}`;
    } else if (hasArtistMatches) {
      const artistList = Array.from(artistMatches);

      if (artistList.length === 1) {
        return `More by ${artistList[0]}`;
      } else if (artistList.length === 2) {
        return `More by ${artistList.join(' & ')}`;
      } else {
        return `More by ${artistList[0]} & Others`;
      }
    } else if (hasLabelMatches) {
      const labelList = Array.from(labelMatches);

      if (labelList.length === 1) {
        return `More by ${labelList[0]}`;
      } else if (labelList.length === 2) {
        return `More by ${labelList.join(' & ')}`;
      } else {
        return `More by ${labelList[0]} & Others`;
      }
    }

    const firstProduct = displayedProducts[0];
    const validArtists = firstProduct.validArtists || [];
    const validLabels = firstProduct.validLabels || [];

    if (validArtists.length > 0 && validLabels.length > 0) {
      const artistPart =
        validArtists.length === 1
          ? validArtists[0]
          : validArtists.length === 2
            ? validArtists.join(' & ')
            : `${validArtists[0]} & Others`;

      const labelPart =
        validLabels.length === 1
          ? validLabels[0]
          : validLabels.length === 2
            ? validLabels.join(' & ')
            : `${validLabels[0]} & Others`;

      return `More by ${artistPart} & ${labelPart}`;
    } else if (validArtists.length > 0) {
      return validArtists.length === 1
        ? `More by ${validArtists[0]}`
        : validArtists.length === 2
          ? `More by ${validArtists.join(' & ')}`
          : `More by ${validArtists[0]} & Others`;
    } else if (validLabels.length > 0) {
      return validLabels.length === 1
        ? `More by ${validLabels[0]}`
        : validLabels.length === 2
          ? `More by ${validLabels.join(' & ')}`
          : `More by ${validLabels[0]} & Others`;
    }

    return 'More by Same Artist/Label';
  };

  const getTagBasedTitle = () => {
    return 'More like this';
  };

  const renderProductSection = (products, title, sectionType = 'default') => {
    if (!products.length) return null;

    const productsToShow = products.slice(0, 12);

    const sectionTitle =
      sectionType === 'artistLabel' ? getArtistLabelTitle(productsToShow) : title;

    if (sectionType === 'artistLabel' && !sectionTitle) {
      return null;
    }

    return (
      <section className="mb-5">
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 fw-semibold">{sectionTitle}</h3>
            </div>
          </div>
        </div>

        <GridContainer>
          {productsToShow.map((product, index) => {
            const hasPlaceholder =
              product.hasPlaceholder || product.imageUrl === '/placeholder.jpg';

            const productForCard = {
              id: product.swellProductId || product._id,
              name: product.title || 'Untitled',
              title: product.title || 'Untitled',
              price: product.price || 0,
              handle: product.resolvedSlug || product.slug || product.swellProductId,
              slug: product.resolvedSlug || product.slug || product.swellProductId,

              mainImage: hasPlaceholder
                ? {
                    asset: {
                      url: '/placeholder.jpg',
                      metadata: {
                        dimensions: {
                          width: product.imageWidth || 800,
                          height: product.imageHeight || 800
                        }
                      }
                    }
                  }
                : product.imageUrl
                  ? {
                      asset: {
                        url: product.imageUrl,
                        metadata: {
                          lqip: product.lqipData,
                          dimensions: {
                            width: product.imageWidth || 800,
                            height: product.imageHeight || 800
                          }
                        }
                      }
                    }
                  : undefined,

              imageUrl: product.imageUrl,
              description: product.description || '',
              variants: product.variants || [],
              stock_status: 'in_stock',

              tracklist: product.tracklist || [],

              discogsReleaseId: product.discogsReleaseId,
              tracklistEnhanced: product.tracklistEnhanced,
              tracklistLastUpdated: product.tracklistLastUpdated,

              sanityContent: {
                _id: product._id,
                title: product.title,
                artist: product.artist,
                label: product.label,
                genre: product.genre,
                format: product.format,
                tags: product.tags,
                discogsReleaseId: product.discogsReleaseId,
                tracklistEnhanced: product.tracklistEnhanced,
                tracklistLastUpdated: product.tracklistLastUpdated,
                tracklist: product.tracklist || [],
                description: product.description,
                mainImage: hasPlaceholder ? null : product.sanityContent?.mainImage
              },

              content: {
                artist: Array.isArray(product.artist)
                  ? product.artist.join(', ')
                  : product.artist || '',
                label: Array.isArray(product.label)
                  ? product.label.join(', ')
                  : product.label || '',
                genre: product.genre || (Array.isArray(product.tags) ? product.tags[0] : ''),
                format: product.format || ''
              }
            };

            return (
              <GridItem
                key={product.swellProductId || product._id}
                type="product"
                id={productForCard.id}
                inStock={true}
                category={product.originalCategory || sectionType}
                featured={false}
              >
                <div className="position-relative">
                  <ProductCard product={productForCard} priority={index < 6} />
                </div>
              </GridItem>
            );
          })}
        </GridContainer>
      </section>
    );
  };

  return (
    <div className="related-products py-5">
      {!shouldConsolidate &&
        finalArtistLabelProducts.length > 0 &&
        renderProductSection(finalArtistLabelProducts, getArtistLabelTitle(), 'artistLabel')}

      {finalTagBasedProducts.length > 0 &&
        renderProductSection(finalTagBasedProducts, getTagBasedTitle(), 'tags')}
    </div>
  );
}
