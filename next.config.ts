/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables explicitly
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
  },

  // Configure for Turbopack
  experimental: {
    turbo: {}
  }
}

// Log environment variables at startup
console.log('Configuration Environment Check:');
console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
console.log('GITHUB_TOKEN length:', process.env.GITHUB_TOKEN?.length);

module.exports = nextConfig