// components/product/Content.tsx
'use client';

import { AddToCart } from 'components/cart/add-to-cart';
import { WantlistButton } from 'components/product/WantlistButton';
import Price from 'components/ui/price';
import Prose from 'components/ui/prose';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SanityProductProvider } from '../../contexts/SanityProductContext';
import EnhancedTracklist from './EnhancedTracklist';
import InMixtapes from './InMixtapes';
import TracklistUpdater from './TracklistUpdater';
import { Artist, Catalog, Country, Format, Genre, Label, Released } from './productComponents';
import { VariantSelector } from './variant-selector';
function Condition({ product }: { product: any }) {
  const hasConditionInfo = product.media || product.sleeve || product.notes;

  if (!hasConditionInfo) return null;

  return (
    <div className="condition mb-3">
      {product.media && (
        <div className="condition-item mb-1">
          <span className="media-condition fw-bold me-1">Media:</span>
          <span className="condition-value">{product.media}</span>
        </div>
      )}
      {product.sleeve && (
        <div className="condition-item mb-1">
          <span className="sleeve-condition fw-bold me-1">Sleeve:</span>
          <span className="condition-value">{product.sleeve}</span>
        </div>
      )}
      {product.notes && (
        <div className="condition-item mb-1">
          <span className="condition-notes">{product.notes}</span>
        </div>
      )}
    </div>
  );
}

export function ProductDescription({
  product,
  initialSanityContent,
  sanityProduct
}: {
  product: any;
  initialSanityContent?: any;
  sanityProduct?: any;
}) {
  const searchParams = useSearchParams();
  const [displayPrice, setDisplayPrice] = useState<number | null>(product.price);

  const hasTracklist = initialSanityContent?.tracklist && initialSanityContent.tracklist.length > 0;

  const hasMixtapes =
    initialSanityContent?.inMixtapes && initialSanityContent.inMixtapes.length > 0;

  const isGiftCard =
    product?.slug === 'gift-card' ||
    product?.name?.toLowerCase().includes('gift card') ||
    product?.type === 'giftcard' ||
    product?.delivery === 'giftcard';

  const isAvailable: boolean = (() => {
    if (isGiftCard) {
      return true;
    }

    const stockStatus = (product as any).stock_status;
    if (stockStatus !== null && stockStatus !== undefined) {
      return stockStatus === 'in_stock';
    }

    if (product.stockPurchasable !== undefined && product.stockPurchasable !== null) {
      return Boolean(product.stockPurchasable);
    }

    if (product.stockTracking) {
      return Boolean(product.stockLevel && product.stockLevel > 0);
    }

    return Boolean(product.stock_level && product.stock_level > 0);
  })();

  useEffect(() => {
    if (isGiftCard) {
      const firstOption = product.options?.[0];
      if (firstOption?.values?.length) {
        const selectedValue = searchParams.get('Value') || searchParams.get('value');

        if (selectedValue) {
          const selectedOptionValue = firstOption.values.find(
            (v: any) => v.name === selectedValue || v.id === selectedValue
          );

          if (selectedOptionValue && typeof selectedOptionValue.price === 'number') {
            setDisplayPrice(selectedOptionValue.price);
            return;
          }
        }

        setDisplayPrice(null);
      }
    } else {
      setDisplayPrice(product.price);
    }
  }, [searchParams, isGiftCard, product.options, product.price]);

  return (
    <SanityProductProvider
      productId={product.id}
      sku={(product as any).sku || null}
      initialContent={initialSanityContent}
    >
      <div className="container-fluid col product-info p-0 pt-2">
        <div className="sticky-top z-1 px-3">
          <div className="col artist fs-4 d-inline pe-3">
            <Artist linkToArchive={true} />
            <h1 className="product_title entry-title fs-4 bold mono lh-base d-inline mb-0 ms-1 bg-white">
              {product.name}
            </h1>
          </div>
        </div>
        <div className="row mx-0 mb-3 px-0">
          <div className="label m-0 mx-0 mb-3 px-3">
            <Label linkToArchive={true} />
          </div>
          <div className="description long m-0 mb-2 px-3">
            <Prose
              className="text-sm leading-tight dark:text-white/[60%]"
              html={product.description || ''}
            />
          </div>
        </div>

        {hasMixtapes && (
          <div className="row mx-0 px-0">
            <div className="col in-mixtapes px-3 pt-3">
              <InMixtapes
                product={product}
                sanityContent={initialSanityContent}
                rowClassName="row loop justify-content-start"
              />
            </div>
          </div>
        )}
      </div>

      {hasTracklist && (
        <div className="tracklist-container tracklist justify-content-center container-fluid col-md-3 col-xl-2 z-1 m-0 p-0">
          <div className="sticky-top">
            <TracklistUpdater swellProduct={product} sanityContent={initialSanityContent} />
            <EnhancedTracklist
              swellProduct={product}
              sanityContent={initialSanityContent}
              title="Tracklist"
            />
          </div>
        </div>
      )}

      <div className="col-md-3 attr container-fluid z-1 p-3">
        <div className="sticky-top">
          <VariantSelector
            options={product.options || []}
            variants={product.variants?.results || []}
            stockPurchasable={isAvailable}
          />
          {isAvailable ? (
            <>
              <AddToCart
                key={`addtocart-${displayPrice}`}
                product={product}
                availableForSale={isAvailable}
                currentPrice={displayPrice}
                hasSelectedVariant={!isGiftCard || displayPrice !== null}
              />
            </>
          ) : (
            <div className="mb-3">
              <WantlistButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug
                }}
                variant={null}
                className="btn btn-outline-secondary w-100"
                size="md"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Get notified when this item is back in stock
              </div>
            </div>
          )}
          {isAvailable && (
            <>
              <Price
                amount={String(displayPrice || 0)}
                currencyCode={product.currency}
                className={displayPrice === null ? 'opacity-50' : ''}
              />
              <Condition product={product} />
            </>
          )}

          <div className="product-metadata">
            <Catalog />
            <Format />
            <Released />
            <Country />
            <Genre />
          </div>
        </div>
      </div>
    </SanityProductProvider>
  );
}
