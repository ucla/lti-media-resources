const FtpClient = require('ftp');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const RegistrarService = require('../services/registrar');
const UpdateVideoResServices = require('../services/UpdateReserveServices');
const LogServices = require('../services/LogServices');

/**
 * The main process
 */
async function main() {
  const logger = await LogServices.createLogger('update-videores');
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
        media.subjectArea = mappedPair[0].subjectArea;
      } else {
        const shortnameResponse = await RegistrarService.getShortname(
          media.term,
          media.srs
        );
        const shortname = shortnameResponse
          ? shortnameResponse.shortname
          : null;
        const subjectArea = shortnameResponse
          ? shortnameResponse.subjectArea
          : null;

        if (!shortnameResponse) {
          logger.warn(`${media.term}-${media.srs} does not have shortname`);
        } else if (!media.filename.includes(shortname)) {
          logger.warn(
            `Shortname of file ${media.filename} does not match the shortname of class ${media.srs} of term ${media.term}`
          );
        }
        media.classShortname = shortname;
        media.subjectArea = subjectArea;
        srsShortnameMap.push({
          term: media.term,
          srs: media.srs,
          classShortname: shortname,
          subjectArea,
        });
      }
    }

    // For each course, update its records
    let totalNumDiff = 0;
    for (const srsPair of srsShortnameMap) {
      totalNumDiff += await UpdateVideoResServices.updateRecordsForClass(
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
    const totalNumEntries = result.length;
    if (totalNumDiff < 0) {
      logger.info(
        `Done. Processed ${totalNumEntries} entries with ${-totalNumDiff} deletion(s).`
      );
    } else {
      logger.info(
        `Done. Processed ${totalNumEntries} entries with ${totalNumDiff} insertion(s).`
      );
    }
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
