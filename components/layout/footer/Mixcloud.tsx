// components/layout/footer/Mixcloud.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersistentPlayer } from '../../../contexts/PersistentPlayerContext';

export default function MixcloudFooter() {
  const { playerState, hidePlayer, setPlaying } = usePersistentPlayer();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [widgetInstance, setWidgetInstance] = useState<any>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const mixtapeData = playerState.mixtapeData;

  // Load Mixcloud Widget API (only when mixtapeData changes)
  useEffect(() => {
    if (!window.Mixcloud && mixtapeData) {
      const script = document.createElement('script');
      script.src = 'https://widget.mixcloud.com/media/js/widgetApi.js';
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      document.head.appendChild(script);
    } else if (window.Mixcloud && mixtapeData) {
      initializeWidget();
    }
  }, [mixtapeData]); // Only depend on mixtapeData

  // Update global functions when state changes (separate effect)
  useEffect(() => {
    (window as any).hasUserInteractedWithPlayer = () => {
      return hasUserInteracted;
    };

    (window as any).toggleMixcloudPlayer = async () => {
      if (!hasUserInteracted) {
        return false;
      }

      if (!widgetInstance) {
        return false;
      }

      try {
        if (widgetInstance.togglePlay) {
          await widgetInstance.togglePlay();
        } else {
          if (playerState.isPlaying) {
            await widgetInstance.pause();
          } else {
            await widgetInstance.play();
          }
        }
        return true;
      } catch (error) {
        console.error('Widget toggle failed:', error);
        return false;
      }
    };
  }, [hasUserInteracted, widgetInstance, playerState.isPlaying]); // Separate effect for state updates

  const initializeWidget = useCallback(() => {
    if (!iframeRef.current || !window.Mixcloud) return;

    try {
      const widget = window.Mixcloud.PlayerWidget(iframeRef.current);

      widget.ready
        .then(() => {
          setIsReady(true);
          setWidgetInstance(widget);

          // Set up event listeners
          widget.events.play.on(() => {
            setPlaying(true);
            setHasUserInteracted(true); // User has successfully started playback
          });

          widget.events.pause.on(() => {
            setPlaying(false);
          });

          widget.events.ended.on(() => {
            setPlaying(false);
          });

          // Don't create global functions here - they're created in the main useEffect
          // Don't attempt auto-play - let user initiate
        })
        .catch((error) => {
          console.error('Widget initialization failed:', error);
        });
    } catch (error) {
      console.error('Error creating widget:', error);
    }
  }, [playerState.isPlaying, setPlaying]); // Removed hasUserInteracted from deps to avoid stale closure

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).toggleMixcloudPlayer) {
        delete (window as any).toggleMixcloudPlayer;
      }
      if ((window as any).hasUserInteractedWithPlayer) {
        delete (window as any).hasUserInteractedWithPlayer;
      }
    };
  }, []);

  const handleManualPlay = useCallback(async () => {
    if (widgetInstance && isReady) {
      try {
        if (playerState.isPlaying) {
          await widgetInstance.pause();
        } else {
          await widgetInstance.play();
          setHasUserInteracted(true); // Mark that user has interacted
        }
      } catch (error) {
        console.error('Manual play/pause failed:', error);
      }
    } else {
      if (iframeRef.current) {
        iframeRef.current.focus();
        iframeRef.current.click();
      }
    }
  }, [widgetInstance, isReady, playerState.isPlaying]);

  const handleIframeClick = useCallback(() => {
    // Don't automatically set playing here - let the widget events handle it
  }, []);

  if (!playerState.isVisible || !mixtapeData) return null;

  return (
    <div
      className="position-fixed w-100 border-top d-flex bottom-0 start-0 bg-white shadow-lg"
      style={{ zIndex: 1050, height: '60px' }}
    >
      {/* Album Art */}
      <div className="flex-shrink-0">
        <Link href={`/mixtape/${mixtapeData.slug || ''}`}>
          {mixtapeData.imageUrl ? (
            <Image
              src={mixtapeData.imageUrl}
              alt={mixtapeData.title}
              width={60}
              height={60}
              className="object-fit-cover"
            />
          ) : (
            <div
              className="bg-light d-flex align-items-center justify-content-center"
              style={{ width: '60px', height: '60px' }}
            >
              ♪
            </div>
          )}
        </Link>
      </div>

      {/* Mixcloud Player - Native Embed */}
      <div className="flex-grow-1" onClick={handleIframeClick}>
        <iframe
          ref={iframeRef}
          width="100%"
          height="60"
          src={mixtapeData.embedUrl}
          frameBorder="0"
          allow="autoplay; fullscreen; encrypted-media"
          title={`${mixtapeData.title} - Mixcloud Player`}
          style={{ display: 'block', cursor: 'pointer' }}
        />
      </div>

      {/* Controls */}
      <div className="d-flex align-items-center px-3">
        <div className="me-3 text-end">
          <div className="fw-bold" style={{ fontSize: '0.875rem' }}>
            {mixtapeData.title}
          </div>
          {mixtapeData.artist && <div className="text-muted small">{mixtapeData.artist}</div>}
          <div className="text-primary small" style={{ fontSize: '0.7rem' }}>
            {!hasUserInteracted
              ? '👆 Click player to start'
              : isReady
                ? playerState.isPlaying
                  ? '🎵 Playing'
                  : '⏸️ Ready'
                : '⏳ Loading...'}
          </div>
        </div>

        {/* Play/Pause Button - Only show after user interaction */}
        {hasUserInteracted && (
          <button
            onClick={handleManualPlay}
            className="btn btn-primary btn-sm me-2"
            disabled={!isReady}
            title={playerState.isPlaying ? 'Pause' : 'Play'}
          >
            {playerState.isPlaying ? '⏸️' : '▶️'}
          </button>
        )}

        {/* Close Button */}
        <button className="btn btn-link text-muted p-1" onClick={hidePlayer} title="Close">
          ×
        </button>
      </div>
    </div>
  );
}
