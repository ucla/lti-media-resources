const axios = require('axios');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const RegistrarService = require('../services/registrar');
const UpdateMusicResServices = require('../services/UpdateReserveServices');
const LogServices = require('../services/LogServices');
const { COLLECTION_TYPE, collectionMap } = require('../../../constants');
const client = require('../models/db');

/**
 * The main process
 */
async function main() {
  const logger = await LogServices.createLogger('update-musicres');
  const dbclient = await client.connect(process.env.DB_URL);
  logger.info(`Connected to database`);

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
