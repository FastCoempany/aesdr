import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  // Session replays run on every error (replaysOnErrorSampleRate: 1.0) and
  // would otherwise record buyer/affiliate free-text verbatim. Mask all text
  // and inputs and block media so no PII leaves in a replay (R5-PI-2).
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
});
