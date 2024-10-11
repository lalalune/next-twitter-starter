/**
 * Next.js configuration
 * https://nextjs.org/docs/pages/api-reference/next-config-js
 *
 * @type {import("next").NextConfig}
 */
const config = {
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  },
  async rewrites() {
    return [
      {
        source: "/__/:path*",
        destination: `https://${process.env.FIREBASE_AUTH_DOMAIN}/__/:path*`,
      },
    ];
  },
};

module.exports = config;
