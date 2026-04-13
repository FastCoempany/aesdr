/**
 * Centralized configuration for timing constants and operational values.
 * Extracted from hardcoded values scattered across cron routes and components.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const TIMING = {
  /** Drip email schedule (days after purchase) */
  drip: {
    day3: { after: 3 * DAY, window: 1 * DAY },
    day7: { after: 7 * DAY, window: 1 * DAY },
  },

  /** Cart abandonment email schedule */
  abandonment: {
    hr1: { after: 1 * HOUR, window: 1 * HOUR },
    hr24: { after: 24 * HOUR, window: 24 * HOUR },
  },

  /** Drop-off prevention email schedule (days of inactivity) */
  dropoff: {
    d5: 5 * DAY,
    d10: 10 * DAY,
    d21: 21 * DAY,
  },

  /** Review request schedule */
  review: {
    afterCompletion: 2 * DAY,
    nudgeAfterRequest: 4 * DAY,
  },

  /** Progress saving */
  progress: {
    debounceMs: 1500,
    maxServerFailures: 3,
  },

  /** Artifact generation */
  artifact: {
    maxDurationSec: 60,
    llmMaxTokens: 4096,
  },

  /** Success page polling */
  successPage: {
    pollIntervalMs: 2000,
    pollTimeoutMs: 30000,
  },

  /** Iframe restore delay */
  iframeRestoreDelayMs: 1500,
} as const;

/** Total number of lessons in the course */
export const TOTAL_LESSONS = 12;
