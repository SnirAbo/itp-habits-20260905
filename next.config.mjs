import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: [process.env.APP_BASE_URL || 'http://localhost:3000'] },
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};

const pwa = withPWA({
  dest: 'public',
  disable: !isProd,
});

const config = pwa(nextConfig);

export default withSentryConfig(config, { silent: true }, { hideSourcemaps: true });
