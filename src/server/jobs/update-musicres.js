const axios = require('axios');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const RegistrarService = require('../services/registrar');
const UpdateMusicResServices = require('../services/UpdateReserveServices');
const LogServices = require('../services/LogServices');
const { COLLECTION_TYPE, collectionMap } = require('../../../constants');

/**
 * The main process
 */
async function main() {
  const logger = await LogServices.createLogger('update-musicres');
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  const dbclient = new MongoClient(dbURL, { useUnifiedTopology: true });
  await dbclient.connect();
  logger.info(`Connected database at ${dbURL}`);

  const res = await axios.get(
    'https://webservices.library.ucla.edu/music/v2/classes'
  );
  let totalNumDiff = 0;
  let totalNumEntries = 0;
  for (const course of res.data.courses) {
    const { term, srs, works } = course;
    const { shortname, subjectArea } = await RegistrarService.getShortname(
      term,
      srs
    );
    if (!shortname) {
      logger.warn(`${course.term}-${course.srs} does not have shortname`);
    }

    for (const work of works) {
      work.term = term;
      work.srs = srs;
      work.classShortname = shortname;
      work.subjectArea = subjectArea;
    }
    totalNumDiff += await UpdateMusicResServices.updateRecordsForClass(
      dbclient,
      collectionMap.get(COLLECTION_TYPE.DIGITAL_AUDIO_RESERVES),
      term,
      srs,
      works,
      logger
    );
    totalNumEntries += works.length;
  }
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
}

main();
