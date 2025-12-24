// next-sitemap.js
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://themixtapeclub.com"

const excludedPaths = [
  "/checkout",
  "/checkout/*",
  "/account",
  "/account/*",
  "/cart",
  "/api/*",
]

module.exports = {
  siteUrl: siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: excludedPaths,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: excludedPaths,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: excludedPaths,
      },
    ],
  },
  transform: async (config, path) => {
    let priority = 0.7
    let changefreq = "daily"

    if (path === "/") {
      priority = 1.0
      changefreq = "daily"
    } else if (path.startsWith("/shop/new")) {
      priority = 0.9
      changefreq = "daily"
    } else if (path.startsWith("/product/")) {
      priority = 0.8
      changefreq = "weekly"
    } else if (path.startsWith("/shop/genre/") || path.startsWith("/shop/artist/") || path.startsWith("/shop/label/")) {
      priority = 0.7
      changefreq = "weekly"
    } else if (path.startsWith("/mixes/")) {
      priority = 0.6
      changefreq = "weekly"
    }

    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}