module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "user-images.githubusercontent.com" },
      { protocol: "https", hostname: "og.railway.app" },
      { protocol: "https", hostname: "og.railway.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cms.railway.com" },
    ],
  },
  compress: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  reactStrictMode: true,
  staticPageGenerationTimeout: 300
}
