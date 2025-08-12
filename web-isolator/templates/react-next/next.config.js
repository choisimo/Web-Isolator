/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://api.{{PROJECT_NAME}}.local',
  },
  // Docker 환경에서 Hot Reload 지원
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

module.exports = nextConfig