require('dotenv').config();
require('babel-polyfill');

const VideoresServices = require('../VideoresServices');
const client = require('../../models/db');
const { COLLECTION_TYPE, collectionMap } = require('../../../../constants');

const { VIDEO_RESERVES, PLAYBACKS } = COLLECTION_TYPE;

const postfix = 'testvideoresservices';
const testCollections = new Map([
  [VIDEO_RESERVES, `${collectionMap.get(VIDEO_RESERVES)}${postfix}`],
  [PLAYBACKS, `${collectionMap.get(PLAYBACKS)}${postfix}`],
]);

beforeAll(async (done) => {
  collectionMap.set(VIDEO_RESERVES, testCollections.get(VIDEO_RESERVES));
  collectionMap.set(PLAYBACKS, testCollections.get(PLAYBACKS));
  await client.connect(process.env.DB_URL);
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.createCollection(col[1]);
  }
  const sampleMedias = [
    {
      classShortname: 'Charms',
      videoTitle: 'Wingardium Leviosa',
      filename: 'wingardiumleviosa.mp4',
    },
    {
      classShortname: 'Charms',
      videoTitle: 'Lumos Solem',
      filename: 'lumossolem.mp4',
    },
    {
      classShortname: 'Charms',
      videoTitle: 'Expelliarmus',
      filename: 'expelliarmus.mp4',
    },
  ];
  await db
    .collection(testCollections.get(VIDEO_RESERVES))
    .insertMany(sampleMedias);
  const samplePlaybacks = [
    {
      classShortname: 'Charms',
      file: 'wingardiumleviosa.mp4',
      mediaType: 1,
      userid: 0,
      finishedTimes: 7,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Charms',
      file: 'wingardiumleviosa.mp4',
      mediaType: 1,
      userid: 1,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Charms',
      file: 'expelliarmus.mp4',
      mediaType: 1,
      userid: 0,
      finishedTimes: 1,
      time: 0,
      remaining: 14,
    },
    {
      classShortname: 'Charms',
      file: 'expelliarmus.mp4',
      mediaType: 1,
      userid: 1,
      finishedTimes: 2,
      time: 0,
      remaining: 0,
    },
    {
      classShortname: 'Charms',
      file: 'lumossolem.mp4',
      mediaType: 1,
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

describe('VideoresServices tests', () => {
  test('Test Analytics Generation', async (done) => {
    const sampleCourse = 'Charms';
    const sampleMembers = [
      { user_id: '0', name: 'Luna Lovegood' },
      { user_id: '1', name: 'Cho Chang' },
    ];
    const analytics = await VideoresServices.getAnalytics(
      sampleCourse,
      sampleMembers
    );
    const correctAnalytics = [
      {
        userid: 0,
        name: 'Luna Lovegood',
        finishedCount: 2,
        totalCount: 3,
        analytics: [
          {
            title: 'Expelliarmus',
            finishedTimes: 1,
            time: 0,
            remaining: 14,
          },
          {
            title: 'Lumos Solem',
            finishedTimes: 0,
            time: 0,
            remaining: 100,
          },
          {
            title: 'Wingardium Leviosa',
            finishedTimes: 7,
            time: 7,
            remaining: 7,
          },
        ],
      },
      {
        userid: 1,
        name: 'Cho Chang',
        finishedCount: 1,
        totalCount: 3,
        analytics: [
          {
            title: 'Expelliarmus',
            finishedTimes: 2,
            time: 0,
            remaining: 100,
          },
          {
            title: 'Lumos Solem',
            finishedTimes: 0,
            time: 0,
            remaining: 100,
          },
          {
            title: 'Wingardium Leviosa',
            finishedTimes: 0,
            time: 7,
            remaining: 7,
          },
        ],
      },
    ];
    expect(analytics).toMatchObject(correctAnalytics);
    done();
  });
});

afterAll(async (done) => {
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await client.close();
  done();
});
