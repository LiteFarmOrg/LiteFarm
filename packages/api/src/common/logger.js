import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';
import * as Sentry from '@sentry/node';

const { errors, json, combine, cli } = format;

// Add the error message as an enumerable property to return with res.json({ error })
const enumerateErrorMessage = format((info) => {
  if (info instanceof Error) {
    info.error = { message: info.message };
  }
  return info;
});

/**
 * Get the log level from a string or default value if not present or invalid
 * @param {any} value log level string
 * @param {string} defaultValue default log level
 * @return {string} valid log level
 */
function getLogLevel(value, defaultValue) {
  if (typeof value !== 'string') {
    return defaultValue;
  }
  value = value.toLowerCase().trim();
  if (
    value === 'error' ||
    value === 'warn' ||
    value === 'info' ||
    value === 'http' ||
    value === 'debug' ||
    value === 'silly' ||
    value === 'off'
  ) {
    return value;
  }
  return defaultValue;
}

/**
 * Check if a string is true.
 * @param {any} value string to check
 * @param {boolean} defaultValue default value if not a string
 * @returns {boolean} true if the string is true, false otherwise
 */
function parseBoolean(value, defaultValue) {
  if (typeof value !== 'string') {
    return defaultValue;
  }
  value = value.toLowerCase().trim();
  if (value === 'true' || value === '1' || value === 'yes' || value === 'on') {
    return true;
  }
  if (value === 'false' || value === '0' || value === 'no' || value === 'off') {
    return false;
  }
  return defaultValue;
}

const rootLogLevel = getLogLevel(process.env.LOG_LEVEL, 'info');

const logger = winston.createLogger({
  level: rootLogLevel === 'off' ? 'info' : rootLogLevel,
  silent: rootLogLevel === 'off',
  format: combine(enumerateErrorMessage(), json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new DailyRotateFile({ filename: './logs/error.log', level: 'error' }),
    new DailyRotateFile({ filename: './logs/combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
const consoleLogLevel = getLogLevel(process.env.LOG_CONSOLE_LEVEL, 'error');

if (consoleLogLevel !== 'off') {
  logger.add(
    new winston.transports.Console({
      level: consoleLogLevel,
      format: combine(errors(), cli()),
    }),
  );
}

// Create custom transport for Sentry reporting
class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Only report if a true Error object
    if (info instanceof Error) {
      Sentry.captureException(info);
    }

    callback();
  }
}

// Report Errors to Sentry
if (process.env.NODE_ENV !== 'development' && parseBoolean(process.env.LOG_ENABLE_SENTRY, true)) {
  logger.add(new SentryTransport());
}

console.log = (...args) => logger.info.call(logger, ...args);
console.info = (...args) => logger.info.call(logger, ...args);
console.warn = (...args) => logger.warn.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);
console.debug = (...args) => logger.debug.call(logger, ...args);

export default logger;
