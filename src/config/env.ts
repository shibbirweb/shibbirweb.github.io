/**
 * Build-time environment flags. `process.env.NODE_ENV` is inlined by the
 * bundler, so these fold to literals and dead-code-eliminate the branches they
 * guard, which keeps dev-only UI (e.g. the navbar Studio group) out of the
 * production build.
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;
