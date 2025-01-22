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
  // Ensure proper transpilation
  transpilePackages: []
}

module.exports = nextConfig