// components/common/OptimizedImages.tsx

'use client';
import { useEffect, useRef, useState } from 'react';

function optimizeImageUrl(url: string, width = 800, quality = 85) {
  if (!url) return url;
  if (url.includes('cdn.sanity.io')) {
    return `${url}?w=${width}&q=${quality}&auto=format&fit=max`;
  }
  return url;
}

const DEFAULT_PLACEHOLDER = {
  src: '/placeholder.jpg',
  srcOriginal: '/placeholder.jpg',
  alt: 'Product placeholder',
  width: 800,
  height: 600,
  priority: true
};

const GIFT_CARD_PLACEHOLDER = {
  src: '/placeholder.jpg',
  srcOriginal: '/placeholder.jpg',
  alt: 'Gift Card',
  width: 800,
  height: 600,
  priority: true
};

interface ImageProps {
  image: {
    src: string;
    srcOriginal: string;
    alt: string;
    width: number;
    height: number;
    priority: boolean;
    blurDataURL?: string;
  };
  index: number;
  enableFadeIn?: boolean;
  variant?: 'product' | 'mixtape';
}

// Simplified image component - restored LQIP functionality
function OptimizedImage({ image, index, enableFadeIn = false, variant = 'product' }: ImageProps) {
  const [imageState, setImageState] = useState({
    isLoaded: false,
    hasError: false,
    showLQIP: false
  });
  const [isMounted, setIsMounted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Single useEffect for mounting and LQIP setup
  useEffect(() => {
    setIsMounted(true);

    // Check if image is already cached
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setImageState((prev) => ({ ...prev, isLoaded: true }));
      return;
    }

    // Show LQIP immediately if we have blur data and fade-in is enabled
    if (image.blurDataURL && enableFadeIn) {
      setImageState((prev) => ({
        ...prev,
        showLQIP: true
      }));
    }
  }, [image.blurDataURL, enableFadeIn]);

  // Preload priority images
  useEffect(() => {
    if (!isMounted || !image.priority) return;

    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = image.src;
    document.head.appendChild(preloadLink);

    const cleanup = () => {
      if (document.head.contains(preloadLink)) {
        document.head.removeChild(preloadLink);
      }
    };

    const timer = setTimeout(cleanup, 5000);
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [isMounted, image.priority, image.src]);

  const containerStyles = {
    width: '400px',
    height: '400px',
    marginTop: '6.6rem',
    marginBottom: '3.3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const
  };

  const imageStyles = {
    minHeight: '400px', // Ensure minimum 400px height
    minWidth: '400px', // Ensure minimum 400px width
    maxHeight: '100%', // Still respect container max
    maxWidth: '100%', // Still respect container max
    objectFit: 'contain' as const,
    width: 'auto',
    height: 'auto'
  };

  if (!isMounted) {
    return (
      <div key={index} className="col-auto p-0">
        <div
          style={{
            ...containerStyles,
            backgroundColor: variant === 'mixtape' ? 'transparent' : '#000'
          }}
        />
      </div>
    );
  }

  const handleLoad = () => {
    setImageState((prev) => ({
      ...prev,
      isLoaded: true,
      hasError: false,
      showLQIP: false
    }));
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement;

    // Try fallback URL if available
    if (image.srcOriginal && imgElement.src !== image.srcOriginal) {
      imgElement.src = image.srcOriginal;
      return;
    }

    setImageState((prev) => ({
      ...prev,
      isLoaded: true,
      hasError: true,
      showLQIP: false
    }));
  };

  // Simplified fade-in logic
  if (!enableFadeIn) {
    return (
      <div key={index} className="col-auto p-0">
        <div style={{ ...containerStyles, backgroundColor: 'transparent' }}>
          <img
            ref={imgRef}
            src={image.src}
            alt={image.alt}
            style={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
            loading={image.priority ? 'eager' : 'lazy'}
            decoding={image.priority ? 'sync' : 'async'}
          />
        </div>
      </div>
    );
  }

  return (
    <div key={index} className="col-auto p-0">
      <div style={containerStyles}>
        {/* LQIP with proper containment */}
        {image.blurDataURL && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${image.blurDataURL})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                filter: 'blur(20px)',
                transform: 'scale(1.0)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        )}

        <img
          ref={imgRef}
          src={image.src}
          alt={image.alt}
          style={{
            ...imageStyles,
            position: 'relative',
            zIndex: 2, // Higher z-index to appear over blur
            opacity: imageState.isLoaded ? 1 : 0, // Fade in over blur
            transition: 'opacity 0.5s ease-in-out',
            display: 'block'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading={image.priority ? 'eager' : 'lazy'}
          decoding={image.priority ? 'sync' : 'async'}
        />
      </div>
    </div>
  );
}

function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

function isGiftCard(product: any): boolean {
  return product?.type === 'giftcard' || product?.delivery === 'giftcard';
}

function resolveAssetUrl(assetRef: string): string | null {
  if (!assetRef || !assetRef.startsWith('image-')) {
    return null;
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  const parts = assetRef.replace('image-', '').split('-');
  if (parts.length >= 3) {
    const assetId = parts[0];
    const dimensions = parts[1];
    const format = parts[2];
    return `https://cdn.sanity.io/images/${projectId}/production/${assetId}-${dimensions}.${format}`;
  }

  return null;
}

export function OptimizedImages({
  handle,
  product,
  sanityBasic,
  mixtape,
  enableFadeIn = false,
  variant
}: {
  handle: string;
  product?: any;
  sanityBasic?: any;
  mixtape?: any;
  enableFadeIn?: boolean;
  variant?: 'product' | 'mixtape';
}) {
  const detectedVariant = variant || (mixtape ? 'mixtape' : 'product');
  const galleryImages = [];

  try {
    if (detectedVariant === 'mixtape') {
      if (mixtape?.featuredImage?.asset?.url) {
        const featuredImage = mixtape.featuredImage;
        const asset = featuredImage.asset;

        galleryImages.push({
          src: optimizeImageUrl(asset.url, 800, 85),
          srcOriginal: asset.url,
          alt: featuredImage.alt || mixtape?.title || 'Mixtape cover',
          blurDataURL: asset.metadata?.lqip,
          width: asset.metadata?.dimensions?.width || 1080,
          height: asset.metadata?.dimensions?.height || 1080,
          priority: true
        });
      }

      if (galleryImages.length === 0) {
        galleryImages.push({
          ...DEFAULT_PLACEHOLDER,
          alt: mixtape?.title || 'Mixtape cover'
        });
      }
    } else {
      // Product variant logic
      if (sanityBasic?.mainImage?.asset?.url) {
        const mainImage = sanityBasic.mainImage;
        const asset = mainImage.asset;

        galleryImages.push({
          src: optimizeImageUrl(asset.url, 800, 85),
          srcOriginal: asset.url,
          alt: mainImage.alt || product?.name || 'Product image',
          blurDataURL: asset.metadata?.lqip,
          width: asset.metadata?.dimensions?.width || 800,
          height: asset.metadata?.dimensions?.height || 600,
          priority: true
        });
      }

      // Additional images
      const additionalImages = safeArray(sanityBasic?.additionalImages);
      additionalImages.forEach((img: any, index: number) => {
        if (img && img._type === 'image' && img.asset) {
          let imageUrl = null;

          if (img.asset.url) {
            imageUrl = img.asset.url;
          } else if (img.asset._ref) {
            imageUrl = resolveAssetUrl(img.asset._ref);
          }

          if (imageUrl) {
            galleryImages.push({
              src: optimizeImageUrl(imageUrl, 800, 85),
              srcOriginal: imageUrl,
              alt: img.alt || `${product?.name || 'Product'} - Image ${index + 2}`,
              blurDataURL: img.asset.metadata?.lqip,
              width: img.asset.metadata?.dimensions?.width || 800,
              height: img.asset.metadata?.dimensions?.height || 600,
              priority: false
            });
          }
        }
      });

      // Fallback to product images if no Sanity images
      if (galleryImages.length === 0) {
        const productImages = safeArray(product?.images);
        productImages.slice(0, 3).forEach((img: any, index: number) => {
          if (img?.file?.url) {
            galleryImages.push({
              src: img.file.url,
              srcOriginal: img.file.url,
              alt: img.caption || `${product?.name || 'Product'} - Image ${index + 1}`,
              width: img.file.width || 800,
              height: img.file.height || 600,
              priority: index === 0
            });
          }
        });
      }

      // Final fallback
      if (galleryImages.length === 0) {
        const placeholder = isGiftCard(product) ? GIFT_CARD_PLACEHOLDER : DEFAULT_PLACEHOLDER;
        galleryImages.push({
          ...placeholder,
          alt: product?.name || 'Product image'
        });
      }
    }

    const containerClass = 'row image justify-content-center z-2 position-relative bg-black';
    const containerStyle = { marginTop: '-6.6rem', overflow: 'hidden' };

    return (
      <div className={containerClass} style={containerStyle}>
        {/* Background blur for mixtape variant */}
        {detectedVariant === 'mixtape' && galleryImages[0]?.src && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '-20px',
                right: '-20px',
                bottom: '-20px',
                backgroundImage: `url(${galleryImages[0].src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(20px) brightness(0.7)',
                zIndex: 0,
                transform: 'scale(1.1)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 1
              }}
            />
          </>
        )}

        {galleryImages.map((image, index) => (
          <OptimizedImage
            key={index}
            image={image}
            index={index}
            enableFadeIn={enableFadeIn}
            variant={detectedVariant}
          />
        ))}
      </div>
    );
  } catch (error) {
    // Error fallback
    const containerClass = 'row image justify-content-center z-2 position-relative bg-black';
    const containerStyle = { marginTop: '-6.6rem', overflow: 'hidden' };
    const errorPlaceholder = isGiftCard(product) ? GIFT_CARD_PLACEHOLDER : DEFAULT_PLACEHOLDER;

    return (
      <div className={containerClass} style={containerStyle}>
        <OptimizedImage
          image={{
            ...errorPlaceholder,
            alt: `Error loading ${detectedVariant} images`
          }}
          index={0}
          enableFadeIn={enableFadeIn}
          variant={detectedVariant}
        />
      </div>
    );
  }
}

export { OptimizedImages as OptimizedMixtapeImages, OptimizedImages as OptimizedProductImages };

export function FastImageSkeleton({ variant = 'product' }: { variant?: 'product' | 'mixtape' }) {
  const containerStyle =
    variant === 'mixtape'
      ? { maxHeight: '550px', overflow: 'hidden' }
      : { marginTop: '-6.6rem', overflow: 'hidden' };

  return (
    <div
      className="row image bg-dark justify-content-center z-2 position-relative"
      style={containerStyle}
    >
      <div
        className="d-flex align-items-center justify-content-center col-auto p-0"
        style={{ minHeight: '400px' }}
      >
        <div className="spinner-border spinner-border-sm text-light" role="status">
          <span className="visually-hidden">Loading images...</span>
        </div>
      </div>
    </div>
  );
}
