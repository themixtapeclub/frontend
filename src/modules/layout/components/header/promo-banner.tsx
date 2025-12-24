// frontend/src/modules/layout/components/header/promo-banner.tsx
"use client"

import { usePromoBanner, PROMO_BANNER_HEIGHT } from "./promo-banner-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromoBanner() {
  const { isVisible, message, linkUrl, linkText, hideBanner } = usePromoBanner()

  return (
    <div
      style={{
        width: '100%',
        height: isVisible ? PROMO_BANNER_HEIGHT + 'px' : '0px',
        overflow: 'hidden',
        transition: 'height 0.3s ease-out',
        borderBottom: isVisible ? '1px solid black' : 'none',
        backgroundColor: '#facc15',
        color: 'black',
      }}
    >
      {isVisible && (
        <div
          className="flex items-center justify-center text-small"
          style={{
            height: PROMO_BANNER_HEIGHT + 'px',
            padding: '0 40px',
            position: 'relative',
            color: 'black',
          }}
        >
          <div className="flex items-center gap-2 bold uppercase">
            <span>{message}</span>
            {linkUrl && linkText && (
              <LocalizedClientLink 
                href={linkUrl}
                className="underline bold"
                style={{ color: 'black' }}
              >
                {linkText}
              </LocalizedClientLink>
            )}
          </div>
          
          <button
            onClick={hideBanner}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 13px',
              fontSize: '14px',
              lineHeight: 1,
              color: 'black',
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}