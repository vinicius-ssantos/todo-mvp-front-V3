export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (err: Error) => {
  // Only log errors in production
  if (process.env.NODE_ENV === "production") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(err);
  }
};
