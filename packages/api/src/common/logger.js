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
 * @param value log level string
 * @param def default log level
 */
function getLogLevel(value, def) {
  if (typeof value !== 'string') return def;
  value = value.toLowerCase().trim();
  if (
    value === 'error' ||
    value === 'warn' ||
    value === 'info' ||
    value === 'http' ||
    value === 'debug' ||
    value === 'silly' ||
    value === 'off'
  )
    return value;
  return def;
}

/**
 * Check if a string is true.
 * @param value string to check
 * @returns {boolean} true if the string is true, false otherwise
 */
function isTrue(value) {
  if (typeof value !== 'string') return false;
  value = value.toLowerCase().trim();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
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
const consoleLogLevel = getLogLevel(
  process.env.LOG_CONSOLE_LEVEL,
  process.env.NODE_ENV !== 'production' ? 'error' : 'off',
);

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
if (process.env.NODE_ENV !== 'development' && !isTrue(process.env.LOG_DISABLE_SENTRY)) {
  logger.add(new SentryTransport());
}

console.log = (...args) => logger.info.call(logger, ...args);
console.info = (...args) => logger.info.call(logger, ...args);
console.warn = (...args) => logger.warn.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);
console.debug = (...args) => logger.debug.call(logger, ...args);

export default logger;
