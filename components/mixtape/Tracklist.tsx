// components/mixtape/Tracklist.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Product {
  _id: string;
  title: string;
  sku?: string;
  swellSlug?: string;
  swellProductId?: string;
  price?: number;
  artist?: string[];
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
  };
}

interface Track {
  _key: string;
  trackTitle: string;
  artist?: string;
  location?: string;
  productId?: number;
  product?: Product;
  productRef?: string;
}

interface TracklistProps {
  tracklist?: Track[];
  tracklistText?: string;
  onTrackClick?: () => void;
  credits?: string;
  getProductImageUrl: (track: any, width?: number, height?: number) => string | null;
  getProductLink: (track: any) => string | null;
}

const Tracklist: React.FC<TracklistProps> = ({
  tracklist,
  tracklistText,
  onTrackClick,
  credits,
  getProductImageUrl,
  getProductLink
}) => {
  return (
    <>
      {(tracklist?.length || tracklistText) && (
        <div className="mono row">
          {tracklist?.length ? (
            <div className="m-0 p-0">
              {tracklist.map((track) => {
                const productImageUrl = getProductImageUrl(track, 400, 400);
                const productLink = getProductLink(track);
                const hasActualProduct = Boolean(productLink);

                const trackContent = (
                  <div className="row">
                    <div className="col-12 col-lg-8 mx-auto">
                      <div className="d-flex align-items-top border-bottom-2">
                        <div className="col-2 col-xl-1 me-3">
                          {hasActualProduct ? (
                            <Image
                              src={productImageUrl || '/placeholder.jpg'}
                              alt={track.trackTitle}
                              className="w-100 h-auto"
                              width={300}
                              height={300}
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <></>
                          )}
                        </div>

                        <div className="col py-2">
                          <div className="min-width-0">
                            <div className="track-artist mb-1">{track.artist}</div>
                            <div className="track-title">
                              <strong>{track.trackTitle}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={track._key}
                    style={{ borderTop: '1px solid #dee2e6' }}
                    className={`tracklist-row ${
                      hasActualProduct ? 'has-product-link' : 'no-product-link'
                    }`}
                  >
                    {hasActualProduct ? (
                      <Link href={productLink!} className="text-decoration-none text-dark">
                        <div className="position-relative container">{trackContent}</div>
                      </Link>
                    ) : (
                      <div
                        className="position-relative container"
                        onClick={(e) => {
                          e.preventDefault();
                          onTrackClick?.();
                        }}
                      >
                        {trackContent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            tracklistText && (
              <div className="row">
                <div className="col-12 col-lg-8 mx-auto">
                  <pre className="small text-muted bg-light text-wrap rounded p-3">
                    {tracklistText}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {credits && (
        <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="mb-4">
              <h3 className="h5 mb-3">Credits</h3>
              <p className="text-muted">{credits}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tracklist;
