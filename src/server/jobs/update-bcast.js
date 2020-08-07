const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require('mongodb');
const registrar = require('../services/registrar');
const UpdateBruincastServices = require('../services/UpdateReserveServices');
const LogServices = require('../services/LogServices');

require('dotenv').config();

// Global variable to store the cookie after logging into BruinCast API
let bcastCookie = '';

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
 * Runs the script's main logic of updating BruinCast media database records
 */
async function main() {
  const logger = await LogServices.createLogger('update-bcast');
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
            if (weekNum === null) {
              logger.log({
                level: 'warning',
                message: `Null response from getWeekNumber for ${mediaEntry['date for recording(s)']}`,
              });
            }

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
          await UpdateBruincastServices.updateRecordsForClass(
            client,
            'bruincastmedia',
            currentTerm,
            currentClassID,
            mediaRecords,
            logger
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

main();
