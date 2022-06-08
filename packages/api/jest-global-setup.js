/**
 * Ensures Jest tests run with node using UTC.
 * This is necessary for consistent date handling.
 */
module.exports = async () => {
  process.env.TZ = 'UTC';
};
