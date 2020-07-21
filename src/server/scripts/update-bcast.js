const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

let bcastCookie = '';
const url = `mongodb://localhost:27017/${process.env.DB_DATABASE}`;

// Converts the term format for passing into BruinCast API
// For example, 20S would be converted to spring-2020
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
      console.log(error);
    });
}

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
      console.log(error);
    });
}

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
      console.log(error);
    });
}

async function insertMediaEntry(client, entry) {
  console.log(entry);
  await client
    .db(process.env.DB_DATABASE)
    .collection('bruincastmedia')
    .insertOne(entry, function(err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log(`Inserted with id: ${res.insertedId}`);
      }
    });
}

async function insertMediaEntries(client, entries) {
  // console.log(entries);
  await client
    .db(process.env.DB_DATABASE)
    .collection('bruincastmedia')
    .insertMany(entries, function(err, res) {
      if (err) {
        console.error(err);
      }
    });
}

async function main() {
  // Log in to BruinCast API and store cookie
  await loginBruinCast();

  const currentTerm = '20S';
  const formattedTerm = convertTerm(currentTerm);

  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect();
    // console.log('Connected!');

    await getCourses(formattedTerm, async function processCourses(
      coursesResponse
    ) {
      const courses = JSON.parse(coursesResponse);

      for await (const course of courses) {
        // console.log(course['srs #']);

        await getMedia(
          formattedTerm,
          course['srs #'],
          async function processMedia(mediaResponse) {
            const mediaEntries = JSON.parse(mediaResponse);
            const mediaDocuments = [];

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
              });
            }

            await insertMediaEntries(client, mediaDocuments);
          }
        );
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

console.log('Running update-bcast.js...');
main();
