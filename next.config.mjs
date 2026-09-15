/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  productionBrowserSourceMaps: false,
  images: {
    // Optimization enabled (requires sharp in production)
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
