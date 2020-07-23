const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require('mongodb');
const winston = require('winston');
require('dotenv').config();

// Global variable to store the cookie after logging into BruinCast API
let bcastCookie = '';

// Global logger that outputs log messages to console and update-bcast.log
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
      filename: `update-bcast.log`,
      level: 'info',
    }),
  ],
});

/**
 * Converts the term from 20S to spring-2020, etc.
 * @param  {String} term Term in the YYQ format where YY is year and Q is quarter
 * @return {String}      Term with spelled out quarter and full year
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
      logger.error(error);
      throw error;
    });
}

/**
 * Sends GET request to BruinCast API to get Class IDs with available media for given term.
 * @param  {String} term Term with spelled out quarter and full year
 * @param  {String} callback Name of callback function
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
      logger.error(error);
      throw error;
    });
}

/**
 * Sends GET request to BruinCast API to get media for given term and Class ID.
 * @param  {String} term Term with spelled out quarter and full year
 * @param  {String} classID Nine-digit Class ID (a.k.a. SRS number)
 * @param  {String} callback Name of callback function
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
      logger.error(error);
      throw error;
    });
}

/**
 * Inserts single JSON-formatted entry into database's BruinCast collection.
 * @param  {MongoClient} client A connected MongoClient
 * @param  {Object} entry JSON-formatted object for media entry
 */
async function insertMediaEntry(client, entry) {
  // logger.info(entry);
  await client
    .db(process.env.DB_DATABASE)
    .collection(process.env.DB_COLLECTION_BRUINCAST)
    .insertOne(entry, function(err, res) {
      if (err) {
        logger.error(err);
        throw err;
      }
    });
}

/**
 * Inserts an array of JSON-formatted entries into database's BruinCast collection.
 * @param  {MongoClient} client A connected MongoClient
 * @param  {[Object]} entries An array of JSON-formatted objects for media entries
 */
async function insertMediaEntries(client, entries) {
  // logger.info(entries);
  await client
    .db(process.env.DB_DATABASE)
    .collection(process.env.DB_COLLECTION_BRUINCAST)
    .insertMany(entries, function(err, res) {
      if (err) {
        logger.error(err);
        throw err;
      }
    });
}

async function main() {
  // Log in to BruinCast API and store cookie
  await loginBruinCast();

  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}`;

  const client = new MongoClient(dbURL, { useUnifiedTopology: true });
  try {
    await client.connect();
    logger.info(`Connected database at ${dbURL}`);

    const currentTerm = '20S';
    const formattedTerm = convertTerm(currentTerm);
    let numTotalRecords = 0;

    logger.info(`Updating records for term: ${currentTerm}`);

    // From the API, get Class IDs with available media for the given term
    await getCourses(formattedTerm, async function(coursesResponse) {
      const courses = JSON.parse(coursesResponse);

      // For each term and Class ID, get the associated media and update records
      for await (const course of courses) {
        logger.info(`Updating records for Class ID: ${course['srs #']}`);
        let numCourseRecords = 0;

        // From the API, get media listings for given term and Class ID
        await getMedia(formattedTerm, course['srs #'], async function(
          mediaResponse
        ) {
          const mediaEntries = JSON.parse(mediaResponse);
          const mediaDocuments = [];

          // For each listing, push new database record into array
          for (const mediaEntry of mediaEntries) {
            mediaDocuments.push({
              classShortname: '20S-MATH33B-1',
              classID: course['srs #'],
              term: currentTerm,
              date: mediaEntry['date for recording(s)'],
              video: mediaEntry.video,
              audio: mediaEntry.audio,
              title: mediaEntry.title,
              comments: mediaEntry.comments,
              timestamp: Date.now(),
            });
          }
          numCourseRecords = mediaDocuments.length;

          // Insert array of database records
          await insertMediaEntries(client, mediaDocuments);
          logger.info(
            `Updated ${numCourseRecords} records for Class ID: ${course['srs #']}`
          );
        });
        numTotalRecords += numCourseRecords;
      }
    });
    logger.info(`Processed ${numTotalRecords} records`);
  } catch (e) {
    logger.error(e);
  } finally {
    await client.close();
  }
}

logger.info('Running update-bcast.js...');
main();
