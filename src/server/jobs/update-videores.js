const FtpClient = require('ftp');
const winston = require('winston');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const RegistrarService = require('../services/registrar');
const UpdateVideoResServices = require('../services/UpdateVideoResServices');

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
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  const dbclient = new MongoClient(dbURL, { useUnifiedTopology: true });
  await dbclient.connect();
  logger.info(`Connected database at ${dbURL}`);

  let result = [];
  const srsShortnameMap = [];

  const c = new FtpClient();
  c.on('ready', function() {
    c.get(process.env.VIDEORES_FILEPATH, function(err, stream) {
      if (err) throw err;
      stream.once('close', function() {
        c.end();
      });
      let str = '';
      stream.on('data', data => {
        str += data.toString();
      });
      stream.on('end', async () => {
        result = UpdateVideoResServices.readStrIntoFields(str, logger);
      });
    });
  });
  c.once('end', async function() {
    // Create an array of courses and get shortname for each course
    for (const media of result) {
      const mappedPair = srsShortnameMap.filter(
        pair => pair.srs === media.srs && pair.term === media.term
      );
      if (mappedPair && mappedPair.length !== 0) {
        media.classShortname = mappedPair[0].classShortname;
      } else {
        const shortName = await RegistrarService.getShortname(
          media.term,
          media.srs
        );
        if (shortName === null) {
          logger.warn(`${media.term}-${media.srs} does not have shortname`);
        } else if (!media.filename.includes(shortName)) {
          logger.warn(
            `Shortname of file ${media.filename} does not match the shortname of class ${media.srs} of term ${media.term}`
          );
        }
        media.classShortname = shortName;
        srsShortnameMap.push({
          term: media.term,
          srs: media.srs,
          classShortname: shortName,
        });
      }
    }

    // Check if collection already exists; if not, create the collection
    const collectionList = await dbclient
      .db(process.env.DB_DATABASE)
      .listCollections()
      .toArray();
    if (!collectionList.map(col => col.name).includes('videoreserves')) {
      await dbclient
        .db(process.env.DB_DATABASE)
        .createCollection('videoreserves');
    }

    // For each course, update its records
    for (const srsPair of srsShortnameMap) {
      await UpdateVideoResServices.updateRecordsForClass(
        dbclient,
        'videoreserves',
        srsPair.term,
        srsPair.srs,
        result.filter(
          media => media.srs === srsPair.srs && media.term === srsPair.term
        ),
        logger
      );
    }
    logger.info('done');
    dbclient.close();
    process.exit(0);
  });
  // Connect to localhost:21 as anonymous
  c.connect({
    host: process.env.VIDEORES_FTP_HOST,
    user: process.env.VIDEORES_FTP_USERNAME,
    password: process.env.VIDEORES_FTP_PWD,
  });
}

main();
