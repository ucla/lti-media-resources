require('dotenv').config();
require('babel-polyfill');

const MusicresServices = require('../MusicresServices');
const client = require('../../models/db');
const { COLLECTION_TYPE } = require('../../../../constants');

const { DIGITAL_AUDIO_RESERVES, PLAYBACKS } = COLLECTION_TYPE;

const testCollections = new Map([
  [DIGITAL_AUDIO_RESERVES, 'musicreservestestmusicresservices'],
  [PLAYBACKS, 'playbackstestmusicresservices'],
]);

beforeAll(async done => {
  process.env.DB_COLLECTION_MUSICRES = testCollections.get(
    DIGITAL_AUDIO_RESERVES
  );
  process.env.DB_COLLECTION_PLAYBACKS = testCollections.get(PLAYBACKS);
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  await client.connect(dbURL);
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.createCollection(col[1]);
  }
  const sampleAlbums = [
    {
      classShortname: 'Herbology',
      title: 'Mandrake',
      items: [
        {
          trackTitle: 'Mandrake cry',
          httpURL: 'http://hplib.com/mandrakecry.mp4',
        },
        {
          trackTitle: 'Petrification cure',
          httpURL: 'http://hplib.com/curepatrification.mp4',
        },
      ],
    },
    {
      classShortname: 'Herbology',
      title: 'Gillyweed',
      items: [
        {
          trackTitle: 'Gillyweed under water',
          httpURL: 'http://hplib.com/gillyweedunderwater.mp4',
        },
      ],
    },
  ];
  await db
    .collection(testCollections.get(DIGITAL_AUDIO_RESERVES))
    .insertMany(sampleAlbums);
  const samplePlaybacks = [
    {
      classShortname: 'Herbology',
      file: 'http://hplib.com/mandrakecry.mp4',
      mediaType: 2,
      userid: 0,
      finishedTimes: 7,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Herbology',
      file: 'http://hplib.com/mandrakecry.mp4',
      mediaType: 2,
      userid: 2,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Herbology',
      file: 'http://hplib.com/gillyweedunderwater.mp4',
      mediaType: 2,
      userid: 0,
      finishedTimes: 1,
      time: 0,
      remaining: 14,
    },
    {
      classShortname: 'Herbology',
      file: 'http://hplib.com/gillyweedunderwater.mp4',
      mediaType: 2,
      userid: 2,
      finishedTimes: 2,
      time: 0,
      remaining: 0,
    },
    {
      classShortname: 'Herbology',
      file: 'http://hplib.com/curepatrification.mp4',
      mediaType: 2,
      userid: 0,
      time: 0,
      remaining: 0,
    },
  ];
  await db
    .collection(testCollections.get(PLAYBACKS))
    .insertMany(samplePlaybacks);
  done();
});

test('Test Analytics Generation', async done => {
  const sampleCourse = { label: 'Herbology' };
  const sampleMembers = [
    { user_id: '0', name: 'Draco Malfoy' },
    { user_id: '1', name: 'Vincent Crabbe' },
    { user_id: '2', name: 'Gregory Goyle' },
  ];
  const analytics = await MusicresServices.getAnalytics(
    sampleCourse,
    sampleMembers
  );
  const correctAnalytics = [
    {
      userid: 0,
      name: 'Draco Malfoy',
      finishedCount: 2,
      totalCount: 3,
      analytics: [
        {
          title: 'Gillyweed - Gillyweed under water',
          finishedTimes: 1,
          time: 0,
          remaining: 14,
        },
        {
          title: 'Mandrake - Mandrake cry',
          finishedTimes: 7,
          time: 7,
          remaining: 7,
        },
        {
          title: 'Mandrake - Petrification cure',
          finishedTimes: 0,
          time: 0,
          remaining: 100,
        },
      ],
    },
    {
      userid: 1,
      name: 'Vincent Crabbe',
      finishedCount: 0,
      totalCount: 3,
      analytics: [
        {
          title: 'Gillyweed - Gillyweed under water',
          finishedTimes: 0,
          time: 0,
          remaining: 100,
        },
        {
          title: 'Mandrake - Mandrake cry',
          finishedTimes: 0,
          time: 0,
          remaining: 100,
        },
        {
          title: 'Mandrake - Petrification cure',
          finishedTimes: 0,
          time: 0,
          remaining: 100,
        },
      ],
    },
    {
      userid: 2,
      name: 'Gregory Goyle',
      finishedCount: 1,
      totalCount: 3,
      analytics: [
        {
          title: 'Gillyweed - Gillyweed under water',
          finishedTimes: 2,
          time: 0,
          remaining: 100,
        },
        {
          title: 'Mandrake - Mandrake cry',
          finishedTimes: 0,
          time: 7,
          remaining: 7,
        },
        {
          title: 'Mandrake - Petrification cure',
          finishedTimes: 0,
          time: 0,
          remaining: 100,
        },
      ],
    },
  ];
  expect(analytics).toMatchObject(correctAnalytics);
  done();
});

afterAll(async done => {
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await client.close();
  done();
});
