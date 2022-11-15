const winston = require('winston');

const logger = winston.createLogger({
    level: "debug",
     format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.errors({ stack: true }),
    ) ,
    transports: [new winston.transports.Console()],
    exitOnError: false,
});

module.exports = logger;