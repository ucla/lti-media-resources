const winston = require('winston');

class LogServices {
  static async createLogger(taskName) {
    // Global variable for current date and time
    const currentTimestamp = new Date();

    // Global logger that outputs log messages to console and .log file
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `logs/${taskName}_${currentTimestamp.getFullYear()}-${currentTimestamp.getMonth() +
            1}-${currentTimestamp.getDate()}_${currentTimestamp.getHours()}-${currentTimestamp.getMinutes()}.log`,
          level: 'debug',
        }),
      ],
    });

    return logger;
  }
}

module.exports = LogServices;
