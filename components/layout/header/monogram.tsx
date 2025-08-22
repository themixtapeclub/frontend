// components/layout/header/monogram.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function Monogram() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationId: number;
    let isTransitioning = false;

    const smoothTransition = (targetRate: number, duration: number = 500) => {
      if (!video) return;

      if (isTransitioning) {
        cancelAnimationFrame(animationId);
      }

      isTransitioning = true;

      if (video.paused && targetRate > 0) {
        video.play().then(() => {
          if (video) {
            video.playbackRate = 0.25;
            animateToTarget();
          }
        });
      } else {
        animateToTarget();
      }

      function animateToTarget() {
        if (!video) return;

        const startRate = video.paused ? 0.25 : video.playbackRate;
        const startTime = Date.now();

        const animate = () => {
          if (!video) return;

          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easeOutCubic = 1 - Math.pow(1 - progress, 3);

          if (targetRate === 0) {
            const newRate = startRate + (0.25 - startRate) * easeOutCubic;
            video.playbackRate = Math.max(0.25, newRate);

            if (progress >= 1) {
              video.pause();
              isTransitioning = false;
              return;
            }
          } else {
            const newRate = startRate + (targetRate - startRate) * easeOutCubic;
            video.playbackRate = Math.max(0.25, Math.min(4.0, newRate));

            if (progress >= 1) {
              video.playbackRate = targetRate;
              isTransitioning = false;
              return;
            }
          }

          animationId = requestAnimationFrame(animate);
        };

        animate();
      }
    };

    const handleSlowVideo = () => smoothTransition(0, 800);
    const handleNormalVideo = () => smoothTransition(1, 600);

    document.addEventListener('sitename:hover:enter', handleSlowVideo);
    document.addEventListener('sitename:hover:leave', handleNormalVideo);

    return () => {
      document.removeEventListener('sitename:hover:enter', handleSlowVideo);
      document.removeEventListener('sitename:hover:leave', handleNormalVideo);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div
      className="monogram position-absolute px-4 py-3"
      style={{
        minHeight: '60px',
        minWidth: '60px',
        pointerEvents: 'none',
        zIndex: 101
      }}
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        loop
        disablePictureInPicture
        className="block"
        style={{
          transition: 'opacity 0.3s ease',
          display: 'block',
          mixBlendMode: 'normal'
        }}
      >
        <source
          src="https://storage.googleapis.com/themixtapeshop/2025/03/343fec70-themixtapeclub-monogram.webm"
          type="video/webm"
        />
        <img
          src="https://storage.googleapis.com/themixtapeshop/2023/03/b9d468ac-monogram.gif"
          alt="the mixtape club logo"
          className="block"
        />
      </video>
    </div>
  );
}
