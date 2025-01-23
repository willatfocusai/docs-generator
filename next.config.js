/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables explicitly
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
  },
  // Add proper image domains if needed
  images: {
    domains: [],
  },
  // Add necessary packages for transpilation
  transpilePackages: ["@radix-ui", "geist"],
  
  // Add webpack configuration for proper module resolution
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false }
    return config
  }
}

module.exports = nextConfig