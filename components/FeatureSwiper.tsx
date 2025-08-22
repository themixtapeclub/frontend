// components/FeatureSwiper.tsx
'use client';

import { getFeatureLink, type Feature } from 'lib/queries/sanity/features';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperCarouselProps {
  autoplay?: boolean;
  spaceBetween?: number;
  slidesPerView?: number;
  limit?: number;
  speed?: number;
  preloadedFeatures?: Feature[];
}

export default function FeatureSwiper({
  autoplay = true,
  spaceBetween = 0,
  slidesPerView = 1,
  limit = 5,
  preloadedFeatures
}: SwiperCarouselProps) {
  const [mounted, setMounted] = useState(false);
  const [features, setFeatures] = useState<Feature[]>(preloadedFeatures || []);
  const [loading, setLoading] = useState(!preloadedFeatures);

  useEffect(() => {
    setMounted(true);

    if (!preloadedFeatures && loading) {
      const fetchFeatures = async () => {
        try {
          const { getFeatures } = await import('lib/queries/sanity/features');
          const fetchedFeatures = await getFeatures(5);
          setFeatures(fetchedFeatures);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      };
      fetchFeatures();
    }
  }, [preloadedFeatures, loading]);

  if (!mounted || loading || !features.length) {
    return null;
  }

  return (
    <div className="swiper-full-width relative h-[600px] w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation
        pagination={{ clickable: true }}
        autoplay={
          autoplay
            ? {
                delay: 8000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
                waitForTransition: true
              }
            : false
        }
        speed={2000}
        effect="slide"
        allowTouchMove={false}
        onInit={(swiper) => {
          const swiperEl = swiper.el as HTMLElement;
          swiperEl.style.setProperty('--swiper-transition-timing-function', 'linear');
        }}
        className="h-full"
        loop={features.length > 1}
      >
        {features.map((feature) => {
          const linkUrl = getFeatureLink(feature);
          const isExternal = feature.externalUrl && feature.externalUrl.startsWith('http');

          return (
            <SwiperSlide key={feature._id}>
              <div className="group relative h-full w-full">
                {feature.image?.asset?.url && (
                  <Image
                    src={feature.image.asset.url}
                    alt={feature.image.alt || feature.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                  />
                )}

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="max-w-2xl text-white">
                    <h2 className="mb-2 text-2xl font-bold lg:mb-4 lg:text-4xl">{feature.title}</h2>

                    {feature.text && (
                      <p className="mb-4 line-clamp-2 text-sm opacity-90 lg:mb-6 lg:text-lg">
                        {feature.text}
                      </p>
                    )}

                    {feature.reference && (
                      <div className="mb-2 text-xs opacity-75 lg:text-sm">
                        {feature.reference._type === 'product' ? '🛒 Shop' : '🎵 Mixtape'}
                      </div>
                    )}

                    <Link
                      href={linkUrl}
                      className="inline-flex items-center rounded bg-white px-4 py-2 font-semibold text-black transition-colors duration-200 hover:bg-gray-100 lg:px-6 lg:py-3"
                      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {feature.externalUrl
                        ? 'Learn More'
                        : feature.reference?._type === 'product'
                          ? 'Shop Now'
                          : feature.reference?._type === 'mixtape'
                            ? 'Listen Now'
                            : 'View More'}

                      {isExternal && (
                        <svg
                          className="ml-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
