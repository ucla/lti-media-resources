const sftpClient = require('ssh2-sftp-client');
require('dotenv').config();
const RegistrarService = require('../services/registrar');
const UpdateVideoResServices = require('../services/UpdateReserveServices');
const LogServices = require('../services/LogServices');
const { COLLECTION_TYPE, collectionMap } = require('../../../constants');
const client = require('../models/db');

/**
 * The main process
 */
async function main() {
  const logger = await LogServices.createLogger('update-videores');
  const dbclient = await client.connect(process.env.DB_URL);
  logger.info(`Connected to database`);

  let result = [];
  const srsShortnameMap = [];

// sftp connectivity
  const c = new sftpClient();
  c.on('ready', function () {
    c.get(process.env.SECRET_VIDEORES_FILEPATH, function (err, stream) {
      if (err) throw err;
      stream.once('close', function () {
        c.end();
      });
      let str = '';
      stream.on('data', (data) => {
        str += data.toString();
      });
      stream.on('end', async () => {
        result = UpdateVideoResServices.readStrIntoFields(str, logger);
      });
    });
  });
  c.once('end', async function () {
    // Create an array of courses and get shortname for each course
    for (const media of result) {
      const mappedPair = srsShortnameMap.filter(
        (pair) => pair.srs === media.srs && pair.term === media.term
      );
      if (mappedPair && mappedPair.length !== 0) {
        media.classShortname = mappedPair[0].classShortname;
        media.subjectArea = mappedPair[0].subjectArea;
      } else {
        const { shortname, subjectArea } = await RegistrarService.getShortname(
          media.term,
          media.srs
        );

        if (!shortname) {
          logger.warn(`${media.term}-${media.srs} does not have shortname`);
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
        collectionMap.get(COLLECTION_TYPE.VIDEO_RESERVES),
        srsPair.term,
        srsPair.srs,
        result.filter(
          (media) => media.srs === srsPair.srs && media.term === srsPair.term
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
    host: process.env.SECRET_VIDEORES_FTP_HOST,
    user: process.env.SECRET_VIDEORES_FTP_USERNAME,
    password: process.env.SECRET_VIDEORES_FTP_PWD,
  });
}

main();
