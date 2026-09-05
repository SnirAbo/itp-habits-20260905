import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
});
