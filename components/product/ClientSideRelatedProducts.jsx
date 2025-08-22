// components/product/ClientSideRelatedProducts.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getRelatedProducts } from '../../lib/queries/sanity/products/relatedProducts';
import RelatedProducts from './RelatedProducts';

// Optimized deduplication - single pass with Set
const deduplicateProducts = (products) => {
  if (!Array.isArray(products)) return [];

  const seen = new Set();
  const result = [];

  for (const product of products) {
    const key =
      product.swellProductId ||
      product.id ||
      product._id ||
      product.sku ||
      product.slug ||
      product.title ||
      product.name;

    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(product);
    }
  }

  return result;
};

export default function ClientSideRelatedProducts({
  currentProduct,
  limit = 12, // Reduced default limit
  serverData = null
}) {
  // Optimized state - single object instead of separate states
  const [state, setState] = useState({
    artistLabelProducts: [],
    tagBasedProducts: [],
    loading: !serverData,
    error: null
  });

  const currentProductRef = useRef();
  const abortControllerRef = useRef(null);

  const productId = currentProduct?.swellProductId || currentProduct?.id || currentProduct?._id;

  // Optimized server data initialization
  useEffect(() => {
    if (serverData) {
      setState({
        artistLabelProducts: serverData.artistLabelProducts || [],
        tagBasedProducts: serverData.tagBasedProducts || [],
        loading: false,
        error: null
      });
      return;
    }
  }, [serverData]);

  // Optimized related products processing with useMemo
  const processedRelatedProducts = useMemo(() => {
    const deduplicatedArtistLabel = deduplicateProducts(state.artistLabelProducts);
    const deduplicatedTagBased = deduplicateProducts(state.tagBasedProducts);

    const currentProductKey =
      currentProduct?.swellProductId ||
      currentProduct?.id ||
      currentProduct?._id ||
      currentProduct?.sku;

    // Early return if no current product key
    if (!currentProductKey) {
      return {
        artistLabelProducts: deduplicatedArtistLabel,
        tagBasedProducts: deduplicatedTagBased
      };
    }

    // Optimized filtering - single pass
    const filterCurrentProduct = (products) => {
      const result = [];
      for (const product of products) {
        const productKey = product.swellProductId || product.id || product._id || product.sku;
        if (productKey !== currentProductKey) {
          result.push(product);
        }
      }
      return result;
    };

    return {
      artistLabelProducts: filterCurrentProduct(deduplicatedArtistLabel),
      tagBasedProducts: filterCurrentProduct(deduplicatedTagBased)
    };
  }, [state.artistLabelProducts, state.tagBasedProducts, currentProduct]);

  // Optimized fetch effect with abort controller
  useEffect(() => {
    // Skip if we have server data or no product ID
    if (serverData || !productId) {
      return;
    }

    // Skip if same product (prevent unnecessary refetches)
    if (currentProductRef.current === productId) {
      return;
    }

    currentProductRef.current = productId;

    async function fetchRelatedProducts() {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Optimized timeout - reduced from 8s to 5s
        const fetchWithTimeout = Promise.race([
          getRelatedProducts({ id: productId, ...currentProduct }, limit),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000))
        ]);

        const result = await fetchWithTimeout;

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (result && typeof result === 'object') {
          setState({
            artistLabelProducts: result.artistLabelProducts || [],
            tagBasedProducts: result.tagBasedProducts || [],
            loading: false,
            error: null
          });
        } else {
          setState({
            artistLabelProducts: [],
            tagBasedProducts: [],
            loading: false,
            error: null
          });
        }
      } catch (err) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setState({
          artistLabelProducts: [],
          tagBasedProducts: [],
          loading: false,
          error: err.message
        });
      }
    }

    fetchRelatedProducts();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [productId, limit, serverData, currentProduct]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <RelatedProducts
      relatedProducts={processedRelatedProducts}
      currentProduct={currentProduct}
      isLoading={state.loading}
    />
  );
}
