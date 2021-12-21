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
    
  c.connect({
    host: process.env.SECRET_VIDEORES_FTP_HOST,
    user: process.env.SECRET_VIDEORES_FTP_USERNAME,
    password: process.env.SECRET_VIDEORES_FTP_PWD
  }).then(() => {
    logger.info('reading file ....', process.env.SECRET_VIDEORES_FILEPATH);
    return c.get(process.env.SECRET_VIDEORES_FILEPATH);
  })
  .then(async (data) => {
    let str = '';
    str += data.toString();
    result = UpdateVideoResServices.readStrIntoFields(str, logger);
    data.results = result;
    return data;
  })
  .then(async (data) => {
    logger.info('processing the results... ')
    // Create an array of courses and get shortname for each course
    for (const media of data.results) {
      const mappedPair = srsShortnameMap.filter(
        (pair) => pair.srs === media.srs && pair.term === media.term
      );
      if (mappedPair && mappedPair.length !== 0) {
        media.classShortname = mappedPair[0].classShortname;
        media.subjectArea = mappedPair[0].subjectArea;
      } else {
        const { shortname, subjectArea } = RegistrarService.getShortname(
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
    logger.info('iterate srsShortnameMap results.... ')
    for (const srsPair of srsShortnameMap) {
      totalNumDiff += UpdateVideoResServices.updateRecordsForClass(
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
    logger.info('totalNumDiff length .... ', totalNumDiff.length);
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
  })
  .catch(err => {
    console.error(err.message);
    c.end();
  });
  console.log('at the end  .... ')
}

main();
