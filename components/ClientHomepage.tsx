'use client';

import { useEffect } from 'react';

interface ClientHomepageProps {
  children: React.ReactNode;
}

export default function ClientHomepage({ children }: ClientHomepageProps) {
  useEffect(() => {
    const handleSwiperUpdate = () => {
      setTimeout(() => {
        const swipers = document.querySelectorAll('.swiper');
        swipers.forEach((swiper: any) => {
          if (swiper.swiper) {
            swiper.swiper.update();
          }
        });
      }, 100);
    };

    window.addEventListener('load', handleSwiperUpdate);
    if (document.readyState === 'complete') {
      handleSwiperUpdate();
    }

    return () => {
      window.removeEventListener('load', handleSwiperUpdate);
    };
  }, []);

  return <>{children}</>;
}
