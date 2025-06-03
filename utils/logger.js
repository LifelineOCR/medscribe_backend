import winston from 'winston';

const { createLogger, format, transports, addColors } = winston;
const { combine, timestamp, printf, colorize } = format;

// Define custom colors for the logger
addColors({
	error: 'red',
	warn: 'yellow',
	info: 'blue',
	debug: 'green',
	http: 'cyan',
	silly: 'magenta',
});

const logFormat = printf(({ level, message, timestamp }) => {
	return `${level} [${message}]: ${timestamp}`;
});

// Create the logger instance

const logger = createLogger({
	transports: [
		new transports.File({ filename: 'log/error.log', level: 'error' }),
		new transports.File({ filename: 'log/combined.log' }),
		new transports.Console({
			format: combine(
				logFormat,
				colorize({ all: true }),
			),
			level: 'debug', // Set console log level to debug
		}),
	],
	format: combine(
		timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		logFormat,
		colorize({ all: true }
	),
),
});

export default logger;