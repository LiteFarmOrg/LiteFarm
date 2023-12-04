import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { errors, json, combine } = format;

// Add the error message as an enumerable property to return with res.json({ error })
const enumerateErrorMessage = format((info) => {
  if (info instanceof Error) {
    info.error = { message: info.message };
  }
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(enumerateErrorMessage(), json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new DailyRotateFile({ filename: './logs/error.log', level: 'error' }),
    new DailyRotateFile({ filename: './logs/combined.log' }),
    new winston.transports.Console({ level: 'info' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(errors(), json()),
    }),
  );
}

console.log = (...args) => logger.info.call(logger, ...args);
console.info = (...args) => logger.info.call(logger, ...args);
console.warn = (...args) => logger.warn.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);
console.debug = (...args) => logger.debug.call(logger, ...args);

export default logger;
