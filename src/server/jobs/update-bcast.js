const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require('mongodb');
const winston = require('winston');
const registrar = require('../services/registrar');
require('dotenv').config();

// Global variable to store the cookie after logging into BruinCast API
let bcastCookie = '';

// Global variable for current date and time
const currentTimestamp = new Date();

// Global logger that outputs log messages to console and update-bcast_YEAR-MONTH-DAY_HOUR-MIN.log
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
      filename: `logs/update-bcast_${currentTimestamp.getFullYear()}-${currentTimestamp.getMonth() +
        1}-${currentTimestamp.getDate()}_${currentTimestamp.getHours()}-${currentTimestamp.getMinutes()}.log`,
      level: 'info',
    }),
  ],
});

/**
 * Converts the term from 20S to spring-2020, etc.
 *
 * @param  {string} term Term in the YYQ format where YY is year and Q is quarter
 * @returns {string}      Term with spelled out quarter and full year
 */
function convertTerm(term) {
  let formattedTerm = `20${term.charAt(0)}${term.charAt(1)}`;
  switch (term.charAt(2)) {
    case 'F':
      formattedTerm = `fall-${formattedTerm}`;
      break;
    case 'W':
      formattedTerm = `winter-${formattedTerm}`;
      break;
    case 'S':
      formattedTerm = `spring-${formattedTerm}`;
      break;
    default:
      formattedTerm = `summer-${formattedTerm}`;
      break;
  }
  return formattedTerm;
}

/**
 * Logs in to BruinCast API and stores cookie in global variable
 */
async function loginBruinCast() {
  const data = qs.stringify({
    username: process.env.BRUINCAST_API_USERNAME,
    password: process.env.BRUINCAST_API_PASSWORD,
  });

  const config = {
    method: 'post',
    url: process.env.BRUINCAST_API_LOGIN,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  };

  await axios(config)
    .then(response => {
      // Formats the BruinCast cookie in the format of 'session_name=sessid'
      bcastCookie = `${response.data.session_name}=${response.data.sessid}`;
    })
    .catch(error => {
      throw error;
    });
}

/**
 * Sends GET request to BruinCast API to get Class IDs with available media for given term.
 *
 * @param  {string} term Term with spelled out quarter and full year
 * @param  {string} callback Name of callback function
 */
async function getCourses(term, callback) {
  const config = {
    method: 'get',
    url: `${process.env.BRUINCAST_API}?display_id=ccle_api_courses&args[0]=${term}`,
    headers: {
      Cookie: bcastCookie,
    },
  };

  await axios(config)
    .then(async function(response) {
      await callback(JSON.stringify(response.data));
    })
    .catch(error => {
      throw error;
    });
}

/**
 * Sends GET request to BruinCast API to get media for given term and Class ID.
 *
 * @param  {string} term Term with spelled out quarter and full year
 * @param  {string} classID Nine-digit Class ID (a.k.a. SRS number)
 * @param  {string} callback Name of callback function
 */
async function getMedia(term, classID, callback) {
  const config = {
    method: 'get',
    url: `${process.env.BRUINCAST_API}?display_id=ccle_api_media&args[0]=${term}&args[1]=${classID}`,
    headers: {
      Cookie: bcastCookie,
    },
  };

  await axios(config)
    .then(async function(response) {
      await callback(JSON.stringify(response.data));
    })
    .catch(error => {
      throw error;
    });
}

/**
 * Inserts an array of JSON-formatted entries into database's BruinCast collection.
 *
 * @param  {MongoClient} client A connected MongoClient
 * @param  {ClientSession} session A session started by client
 * @param  {Array} entries An array of JSON-formatted objects for media entries
 * @returns {number} Number of records inserted into the collection
 */
async function insertMediaEntries(client, session, entries) {
  const result = await client
    .db(process.env.DB_DATABASE)
    .collection('bruincastmedia')
    .insertMany(entries, { session });
  return result.insertedCount;
}

/**
 * Deletes all media entries for a given term and Class ID
 *
 * @param  {MongoClient} client A connected MongoClient
 * @param  {ClientSession} session A session started by client
 * @param  {string} classTerm A class term formatted as YYQ
 * @param  {string} classIDnum A 9-digit Class ID
 * @returns {number} Number of records deleted in the collection
 */
async function deleteMediaEntriesForClass(
  client,
  session,
  classTerm,
  classIDnum
) {
  const query = {
    term: classTerm,
    classID: classIDnum,
  };
  const result = await client
    .db(process.env.DB_DATABASE)
    .collection('bruincastmedia')
    .deleteMany(query, { session });
  return result.deletedCount;
}

/**
 * For a given term and Class ID, delete all records and insert new entries
 *
 * @param  {MongoClient} client A connected MongoClient
 * @param  {string} classTerm A class term formatted as YYQ
 * @param  {string} classIDnum A 9-digit Class ID
 * @param  {Array} entries An array of JSON-formatted objects for media entries
 */
async function updateRecordsForClass(client, classTerm, classIDnum, entries) {
  const session = client.startSession();
  session.startTransaction();
  try {
    const numDeleted = await deleteMediaEntriesForClass(
      client,
      session,
      classTerm,
      classIDnum
    );
    const numInserted = await insertMediaEntries(client, session, entries);
    await session.commitTransaction();
    session.endSession();
    if (numDeleted === numInserted) {
      logger.log('verbose', 'No records added/deleted');
    } else if (numDeleted < numInserted) {
      logger.info(`Added ${numInserted - numDeleted} record(s)`);
    } else {
      logger.info(`Deleted ${numDeleted - numInserted} record(s)`);
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * Runs the script's main logic of updating BruinCast media database records
 */
async function main() {
  // Log in to BruinCast API and store cookie
  await loginBruinCast();

  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  const client = new MongoClient(dbURL, { useUnifiedTopology: true });

  try {
    await client.connect();
    logger.info(`Connected database at ${dbURL}`);

    const currentTerm = process.argv[2];
    if (!currentTerm) {
      throw new Error(
        'Missing command line argument: Term required. (e.g. 20S)'
      );
    }

    const formattedTerm = convertTerm(currentTerm);
    let numTotalRecords = 0;

    logger.info(`Updating records for term: ${currentTerm}`);

    // From the API, get Class IDs with available media for the given term
    await getCourses(formattedTerm, async function(coursesResponse) {
      const courses = JSON.parse(coursesResponse);

      // For each term and Class ID, get the associated media and update records
      for await (const course of courses) {
        const currentClassID = course['srs #'];
        const currentClassShortname = await registrar.getShortname(
          currentTerm,
          currentClassID
        );
        logger.info(
          `Updating records for ${currentClassShortname} (Class ID: ${currentClassID})`
        );
        let numCourseRecords = 0;

        // From the API, get media listings for given term and Class ID
        await getMedia(formattedTerm, currentClassID, async function(
          mediaResponse
        ) {
          const mediaEntries = JSON.parse(mediaResponse);
          const mediaRecords = [];

          // For each listing, push new database record into array
          for (const mediaEntry of mediaEntries) {
            const weekNum = await registrar.getWeekNumber(
              currentTerm,
              mediaEntry['date for recording(s)']
            );
            mediaRecords.push({
              classShortname: currentClassShortname,
              classID: currentClassID,
              term: currentTerm,
              date: mediaEntry['date for recording(s)'],
              week: weekNum,
              video: mediaEntry.video,
              audio: mediaEntry.audio,
              title: mediaEntry.title,
              comments: mediaEntry.comments,
              timestamp: Date.now(),
            });
          }
          numCourseRecords = mediaRecords.length;

          // Update database records
          await updateRecordsForClass(
            client,
            currentTerm,
            currentClassID,
            mediaRecords
          );
        });
        numTotalRecords += numCourseRecords;
      }
    });
    logger.info(`Processed ${numTotalRecords} records`);
  } catch (e) {
    logger.error(e.message);
  } finally {
    await client.close();
  }
}

logger.info('Running update-bcast.js...');
main();
