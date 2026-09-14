/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
