// src/app/layout.tsx
import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { system85Pro, system85MonoPro } from "@lib/fonts"
import "styles/globals.css"

const siteConfig = {
  name: "The Mixtape Club",
  description: "Vinyl records and mixtapes. Discover rare disco house jazz soul and world music on vinyl.",
  url: getBaseURL(),
  ogImage: "/opengraph-image.jpg",
  twitterHandle: "@themixtapeclub",
  locale: "en_US",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "vinyl records",
    "mixtapes",
    "curated music",
    "disco vinyl",
    "house music",
    "jazz records",
    "soul music",
    "world music",
    "rare vinyl",
    "record store",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Curated Vinyl Records`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "ecommerce",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
    sameAs: [],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${system85Pro.variable} ${system85MonoPro.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `history.scrollRestoration='manual';window.scrollTo(0,0);` }} />
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="font-sans bg-white text-black selection:bg-teal-300">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Skip to main content
        </a>
        <div className="relative">{props.children}</div>
      </body>
    </html>
  )
}