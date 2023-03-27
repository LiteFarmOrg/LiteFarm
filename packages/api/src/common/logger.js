import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment';
import express from 'express';
const router = express.Router();

let logger

if (process.env.NODE_ENV != 'development') {
  // This code should probably be reviewed later on
  // But keeping non-development logging identical for now
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      // Write all logs with importance level of `error` or less to `error.log`
      new DailyRotateFile({ filename: './logs/error.log', level: 'error' }),
      // Write all logs with importance level of `info` or less to `combined.log`
      new DailyRotateFile({ filename: './logs/combined.log' }),
      new winston.transports.Console({ level: 'info' })
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }
} else {
  // DEVELOPMENT LOGGING
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    dev: 6 // replace default "silly" with "dev" for dev logging
  }
  const custom_colors = {dev: 'white magentaBG'}
  winston.addColors(custom_colors)
  const colorizer = winston.format.colorize(custom_colors);

  const logFormat = winston.format.printf(info => {
    const prefix = `[${info.level} ${info.timestamp}]`;
    return `${colorizer.colorize(info.level, prefix)} ${info.message}`;
  })

  logger = winston.createLogger({
    levels: levels,
    level: 'dev', // Include all levels
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({format: () => (
            moment().tz(process.env.TZ).format('DD/M HH:mm:ss')
          )}),
          logFormat
        )
      }),
    ]
  });

  // Using alternative syntax just to avoid hits in application wide searches for console . dev
  // In this way it is easy to find and clean out any debugging logs created during development
  Object.assign(console, {dev: (...args) => logger.dev.call(logger, ...args)});

  // Add basic route logging
  router.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`)
    next()
  })
}

console.log = (...args) => logger.info.call(logger, ...args);
console.info = (...args) => logger.info.call(logger, ...args);
console.warn = (...args) => logger.warn.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);
console.debug = (...args) => logger.debug.call(logger, ...args);

export default logger;
export {router as routerLoggingMiddleware}
