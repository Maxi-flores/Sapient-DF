/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Next.js to follow the vault symlink when serving content files.
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./content/**/*"],
    },
  },
};

module.exports = nextConfig;
