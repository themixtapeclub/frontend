// app/layout.tsx - Fix font loading

import ClientProviders from 'components/layout/client-providers';
import Footer from 'components/layout/footer';
import Header, { Monogram } from 'components/layout/header';
import ViewportPreloader from 'components/layout/ViewportPreloader';
import { ensureStartsWith } from 'lib/utils/core';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { system85MonoPro, system85Pro } from '../fonts';
import './globals.scss';

const { TWITTER_CREATOR, TWITTER_SITE, SITE_NAME } = process.env;
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';
const twitterCreator = TWITTER_CREATOR ? ensureStartsWith(TWITTER_CREATOR, '@') : undefined;
const twitterSite = TWITTER_SITE ? ensureStartsWith(TWITTER_SITE, 'https://') : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  },
  other: {
    'permissions-policy': 'encrypted-media=*'
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: 'summary_large_image',
        creator: twitterCreator,
        site: twitterSite
      }
    })
};

interface RootLayoutProps {
  children: ReactNode;
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen">
      <div style={{ minHeight: '600px' }} />
      <div style={{ minHeight: '400px' }} />
      <div style={{ minHeight: '300px' }} />
      <div style={{ minHeight: '200px' }} />
    </main>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${system85Pro.variable} ${system85MonoPro.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <ClientProviders>
          <Header />
          <Monogram />
          <Suspense fallback={<LoadingSkeleton />}>
            <main>{children}</main>
          </Suspense>
          <Footer />
          <ViewportPreloader />
        </ClientProviders>
      </body>
    </html>
  );
}
