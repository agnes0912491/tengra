/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://tengra.studio",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  // Point next-sitemap to the custom Next.js build directory
  sourceDir: ".next-local",
  exclude: ["/admin", "/admin/*", "/api/*"],
  additionalPaths: async (config) => {
    return [];
  },
};
