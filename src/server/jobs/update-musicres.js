const axios = require('axios');
const winston = require('winston');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const RegistrarService = require('../services/registrar');
const UpdateMusicResServices = require('../services/UpdateReserveServices');

// Global variable for current date and time
const currentTimestamp = new Date();

// Global logger that outputs log messages to console and update-videores_YEAR-MONTH-DAY_HOUR-MIN.log
// The file receives any log messages designated at least at 'info' level or higher priority
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
      filename: `logs/update-videores_${currentTimestamp.getFullYear()}-${currentTimestamp.getMonth() +
        1}-${currentTimestamp.getDate()}_${currentTimestamp.getHours()}-${currentTimestamp.getMinutes()}.log`,
      level: 'debug',
    }),
  ],
});

/**
 * The main process
 */
async function main() {
  try {
    const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
    const dbclient = new MongoClient(dbURL, { useUnifiedTopology: true });
    await dbclient.connect();
    logger.info(`Connected database at ${dbURL}`);

    const res = await axios.get(
      'https://webservices.library.ucla.edu/music/v2/classes'
    );
    for (const course of res.data.courses) {
      const { term, srs, works } = course;
      const shortName = await RegistrarService.getShortname(term, srs);
      if (!shortName) {
        logger.warn(`${course.term}-${course.srs} does not have shortname`);
      }
      await UpdateMusicResServices.updateRecordsForClass(
        dbclient,
        'musicreserves',
        term,
        srs,
        works,
        logger
      );
    }
    logger.info('done');
    dbclient.close();
  } catch (e) {
    throw e;
  }
}

main();
