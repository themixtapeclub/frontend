// lib/utils/product.ts

interface ProductImage {
  file?: {
    url?: string;
  };
}

interface ProductOptionValue {
  id?: string;
  name?: string;
}

interface ProductOption {
  id?: string;
  name?: string;
  values?: ProductOptionValue[];
}

interface ProductVariant {
  id?: string;
  option_value_ids?: string[];
}

export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

export function safeObject(obj: any): any {
  return obj && typeof obj === 'object' ? obj : {};
}

export function normalizeProductData(data: any) {
  if (!data) return null;

  const { product, sanityData } = data;

  const normalizedProduct = {
    ...product,
    images: safeArray(product?.images),
    tags: safeArray(product?.tags),
    variants: safeArray(product?.variants),
    options: safeArray(product?.options),
    tracklist: safeArray(product?.tracklist),
    content: safeObject(product?.content),
    sanityContent: safeObject(product?.sanityContent)
  };

  const normalizedSanityData = {
    ...sanityData,
    tracklist: safeArray(sanityData?.tracklist),
    additionalImages: safeArray(sanityData?.additionalImages),
    inMixtapes: safeArray(sanityData?.inMixtapes)
  };

  return {
    product: normalizedProduct,
    sanityData: normalizedSanityData
  };
}

export function getTracklist(product: any, sanityData: any): any[] {
  const sources = [
    sanityData?.tracklist,
    product?.sanityContent?.tracklist,
    product?.tracklist,
    product?.content?.tracklist
  ];

  for (const source of sources) {
    const tracks = safeArray(source);
    if (tracks.length > 0) {
      return tracks;
    }
  }

  return [];
}

export function isGiftCard(product: any): boolean {
  return (
    product?.type === 'giftcard' ||
    product?.delivery === 'giftcard' ||
    product?.name?.toLowerCase().includes('gift card')
  );
}

export function getProductImageUrl(product: any, sanityData?: any): string | null {
  if (sanityData?.mainImage?.asset?.url) {
    return sanityData.mainImage.asset.url;
  }

  const images = safeArray(product?.images) as ProductImage[];
  if (images.length > 0 && images[0]?.file?.url) {
    return images[0].file.url;
  }

  return null;
}

export function getProductOptions(product: any): ProductOption[] {
  const options = safeArray(product?.options) as ProductOption[];

  return options.map((option) => {
    if (!option || typeof option !== 'object') {
      return {
        values: []
      };
    }

    return {
      ...option,
      values: safeArray(option?.values)
    };
  });
}

export function getProductVariants(product: any): ProductVariant[] {
  const variants = safeArray(product?.variants) as ProductVariant[];

  return variants.map((variant) => {
    if (!variant || typeof variant !== 'object') {
      return {
        option_value_ids: []
      };
    }

    return {
      ...variant,
      option_value_ids: safeArray(variant?.option_value_ids)
    };
  });
}

export function debugProductData(product: any, sanityData?: any, label: string = 'Product') {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(`${label} Debug Data:`, {
    productId: product?.id,
    productName: product?.name,
    productType: product?.type,
    productKeys: product ? Object.keys(product) : [],
    productImages: product?.images,
    productImagesType: typeof product?.images,
    productImagesLength: product?.images?.length,
    productOptions: product?.options,
    productOptionsType: typeof product?.options,
    productOptionsLength: product?.options?.length,
    productVariants: product?.variants,
    productVariantsType: typeof product?.variants,
    productVariantsLength: product?.variants?.length,
    productTracklist: product?.tracklist,
    hasInitialSanityContent: Boolean(sanityData),
    initialSanityContentKeys: sanityData ? Object.keys(sanityData) : [],
    initialSanityTracklist: safeArray(sanityData?.tracklist),
    hasSanityProduct: Boolean(sanityData),
    sanityProductKeys: sanityData ? Object.keys(sanityData) : [],
    sanityProductTracklist: safeArray(sanityData?.tracklist),
    possibleTracklistSources: {
      'initialSanityContent.tracklist': safeArray(sanityData?.tracklist),
      'sanityProduct.tracklist': safeArray(sanityData?.tracklist),
      'product.tracklist': safeArray(product?.tracklist),
      'product.sanityContent.tracklist': safeArray(product?.sanityContent?.tracklist)
    }
  });
}

export function createFallbackProduct(handle: string, productType: string = 'product') {
  return {
    id: `fallback-${handle}`,
    name: productType === 'giftcard' ? 'Gift Card' : 'Product',
    type: productType,
    handle,
    images: [],
    options: [],
    variants: [],
    tags: [],
    tracklist: [],
    price: 0,
    currency: 'USD',
    active: true,
    stock_tracking: false,
    content: {},
    sanityContent: {}
  };
}

export function validateProductData(product: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!product?.id && !product?.name) {
    errors.push('Product missing both ID and name');
  }

  if (product?.images === null) {
    warnings.push('Product images is null, should be array');
  }

  if (product?.options === null) {
    warnings.push('Product options is null, should be array');
  }

  if (product?.variants === null) {
    warnings.push('Product variants is null, should be array');
  }

  if (product?.tags === null) {
    warnings.push('Product tags is null, should be array');
  }

  if (isGiftCard(product)) {
    const options = safeArray(product?.options);
    if (options.length === 0) {
      warnings.push('Gift card has no value options');
    } else {
      const valueOption = options[0] as ProductOption;
      const values = safeArray(valueOption?.values);
      if (values.length === 0) {
        warnings.push('Gift card value option has no values');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
