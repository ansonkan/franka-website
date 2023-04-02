const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Note: this seems to be breaking the app but r3f doc is still mentioning this
   * https://docs.pmnd.rs/react-three-fiber/getting-started/installation#next.js
   * and `next-transpile-modules` has already be deprecated and replaced by `transpilePackages`
   *
   * However, the official next + r3f starter (https://github.com/pmndrs/react-three-next) doesn't have that setup
   */
  // transpilePackages: ['three'],
}

module.exports = withBundleAnalyzer(nextConfig)
