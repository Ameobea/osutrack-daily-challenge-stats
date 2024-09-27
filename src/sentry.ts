import * as Sentry from '@sentry/browser';

export const getSentry = (): typeof Sentry | undefined => {
  // Don't clutter up sentry logs with debug stuff
  if (window.location.href.includes('http://localhost')) {
    return undefined;
  }
  return Sentry;
};

export const initSentry = () => {
  // Don't clutter up sentry logs with debug stuff
  if (window.location.href.includes('http://localhost')) {
    return;
  }

  Sentry.init({
    dsn: 'https://d87c4983a61b446d9c08f9eb051fca16@sentry.ameo.design/19',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
};

export const logError = (msg: string, err?: any) => {
  console.error(msg, err);
  const sentry = getSentry();
  if (sentry) {
    if (err) {
      sentry.captureException(err);
    } else {
      sentry.captureMessage(msg, 'error');
    }
  }
};
