const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    // Add alias for the src folder
    config.resolve.alias["@"] = path.resolve(__dirname, "src")
    return config
  },
  env: {
    CHOKIDAR_USEPOLLING: "true", // ✅ Ensures file changes are detected inside Docker
    WATCHPACK_POLLING: "true", // ✅ Improves HMR detection
    NEXTJS_DISABLE_SOURCEMAPS: "true", // ✅ Avoids unnecessary errors
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:80/api/:path*",
      },
    ]
  },
}

module.exports = nextConfig
