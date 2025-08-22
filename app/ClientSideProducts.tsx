import { MergedProduct } from "../lib/data/products/index";
import FeaturedProducts from "components/products/FeaturedProducts";
import FeaturedMixtapes from "components/mixtapes/FeaturedMixtapes";import NewProducts from 'components/products/NewProducts';
import { useEffect, useState } from 'react';

// Types (copy from main file)
interface ExtendedMergedProduct {
  id: string;
  _id?: string;
  name?: string;
  title?: string;
  price?: number;
  stock?: number;
  genre?: string;
  sku?: string;
  stock_purchasable?: boolean;
  stock_level?: number;
  [key: string]: any;
}

interface Mixtape {
  [key: string]: any;
}

interface ProductData {
  featuredProducts: ExtendedMergedProduct[];
  newProducts: ExtendedMergedProduct[];
  mixtapes: Mixtape[];
}

export default function ClientSideProducts() {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiperReady, setSwiperReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔄 Waiting for swiper to be ready...');

        // Wait for swiper to be ready
        if (typeof window !== 'undefined' && (window as any).swiperReady) {
          await (window as any).swiperReady;
          setSwiperReady(true);
          console.log('✅ Swiper confirmed ready, loading products...');
        }

        // Add small delay to ensure smooth transition
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Load data from API routes
        const [productsRes, mixtapesRes] = await Promise.all([
          fetch('/api/products/batch').then((res) => res.json()),
          fetch('/api/mixtapes?type=recent&limit=12').then((res) => res.json())
        ]);

        setData({
          featuredProducts: productsRes.featured || [],
          newProducts: productsRes.new || [],
          mixtapes: mixtapesRes || []
        });

        console.log('✅ Products loaded after swiper');
      } catch (error) {
        console.error('❌ Failed to load products:', error);
        setData({
          featuredProducts: [],
          newProducts: [],
          mixtapes: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Set global variables when data loads
  useEffect(() => {
    if (data && typeof globalThis !== 'undefined') {
      globalThis.featuredProductIds = data.featuredProducts.map((p) => p.id);
      globalThis.featuredProductsComplete = true;
    }
  }, [data]);

  if (loading || !swiperReady) {
    return (
      <div className="products-loading">
        {/* Skeleton loaders that match final layout */}
        <section
          className="featured-products-skeleton"
          style={{ minHeight: '600px', padding: '2rem 0' }}
        >
          <div className="container">
            <div className="mb-4">
              <div
                style={{
                  height: '24px',
                  width: '200px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div className="row">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="col-4 mb-4">
                  <div
                    style={{
                      aspectRatio: '1/1',
                      backgroundColor: '#e9ecef',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  />
                  <div
                    style={{
                      height: '16px',
                      width: '75%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <div
                    style={{
                      height: '14px',
                      width: '50%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <div
                    style={{
                      height: '16px',
                      width: '25%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="new-products-skeleton"
          style={{ minHeight: '400px', padding: '2rem 0' }}
        >
          <div className="container">
            <div className="mb-4">
              <div
                style={{
                  height: '24px',
                  width: '150px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div className="row">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-3 mb-4">
                  <div
                    style={{
                      aspectRatio: '1/1',
                      backgroundColor: '#e9ecef',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  />
                  <div
                    style={{
                      height: '14px',
                      width: '80%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  />
                  <div
                    style={{
                      height: '12px',
                      width: '60%',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mixtapes-skeleton" style={{ minHeight: '200px', padding: '2rem 0' }}>
          <div className="container">
            <div
              style={{
                height: '24px',
                width: '120px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                marginBottom: '16px'
              }}
            />
            <div className="row">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="col-4">
                  <div
                    style={{ height: '60px', backgroundColor: '#e9ecef', borderRadius: '4px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-5 text-center">
        <p>Unable to load products</p>
      </div>
    );
  }

  return (
    <>
      {/* Featured products load after swiper is ready */}
      <section className="homepage-section featured-products-section">
        <FeaturedProducts preloadedData={data.featuredProducts} />
      </section>

      {/* New products */}
      <section className="homepage-section new-products-section">
        <NewProducts
          preloadedData={data.newProducts}
          excludedIds={data.featuredProducts.map((p) => p.id)}
        />
      </section>

      {/* Mixtapes */}
      <section className="homepage-section mixtapes-section">
        <FeaturedMixtapes preloadedData={data.mixtapes} />
      </section>
    </>
  );
}
