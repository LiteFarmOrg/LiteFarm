/**
 * Ensures Jest tests run with node using UTC.
 * This is necessary for consistent date handling.
 */
export default async () => {
  process.env.TZ = 'UTC';
};
