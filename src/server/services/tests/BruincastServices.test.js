require('dotenv').config();
require('babel-polyfill');

const BruincastServices = require('../BruincastServices');
const client = require('../../models/db');

const testCrosslistsCollectionName = 'crossliststests';

beforeAll(async done => {
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  await client.connect(dbURL);
  await client
    .db(process.env.DB_DATABASE)
    .createCollection(testCrosslistsCollectionName);
  done();
});

test('Test Crosslist Services', async done => {
  const sampleData = [
    ['a', 'b', 'c'],
    ['d', 'e'],
  ];
  const updateResult = await BruincastServices.updateCrosslists(
    sampleData,
    testCrosslistsCollectionName
  );
  expect(updateResult.updated).toBe(true);
  expect(updateResult.insertedCount).toBe(2);
  expect(updateResult.deletedCount).toBe(0);
  const allLists = await BruincastServices.getAllCrosslists('crossliststests');
  expect(allLists.length).toBe(2);
  expect(allLists[0].length).toBe(3);
  expect(allLists[1].length).toBe(2);
  const oneList = await BruincastServices.getCrosslistByCourse(
    'a',
    testCrosslistsCollectionName
  );
  expect(oneList.length).toBe(2);
  expect(oneList[0]).toBe('b');
  expect(oneList[1]).toBe('c');
  const deleteResult = await BruincastServices.updateCrosslists(
    [],
    testCrosslistsCollectionName
  );
  expect(deleteResult.updated).toBe(true);
  expect(deleteResult.insertedCount).toBe(0);
  expect(deleteResult.deletedCount).toBe(2);
  done();
});

test('Test formatTermCasts()', async done => {
  const termCasts = [
    {
      _id: '201C-EEBIOL162-1',
      listings: [
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/04/2020',
          week: 10,
          video: '',
          audio: 'eeb162-1-20200604-18600.mp3',
          title: 'Past Lectures',
          comments:
            '<p>Audio recording is from Spring 2017 (date of lecture: 6/8/2017) ... No audio recording from Spring 2018 (6/7/2018)</p>\n',
          timestamp: 1596157101968,
        },
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/02/2020',
          week: 10,
          video: 'eeb162-1-20200602-18599.mp4',
          audio: '',
          title: 'Past Lectures',
          comments: '<svg><g/onload=alert(2)//<p>',
          timestamp: 1596157102195,
        },
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/02/2020',
          week: 10,
          video: '',
          audio: '',
          title: 'No Lecture Today',
          comments: '<svg><g/onload=alert(2)//<p>',
          timestamp: 1596157102195,
        },
      ],
    },
    {
      _id: '20S-COMSCI32-1',
      listings: [
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/11/2020',
          week: 7,
          video: 'cs32-1-20200511-18380.mp4,cs32-1-20200511-19580.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/14/2012</p>\n',
          timestamp: 1596157098921,
        },
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/06/2020',
          week: 6,
          video: 'cs32-1-20200506-18379.mp4',
          audio: 'cs32-1-20200506-18379.mp3',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/7/2012</p>\n',
          timestamp: 1596157099135,
        },
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/04/2020',
          week: 6,
          video: '',
          audio: 'cs32-1-20200504-18378.mp3',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/5/2012</p>\n',
          timestamp: 1596157099334,
        },
      ],
    },
  ];
  const formattedArray = BruincastServices.formatTermCasts(termCasts);
  const expectedArray = [
    {
      _id: '201C-EEBIOL162-1',
      listings: [
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/04/2020',
          week: 10,
          video: '',
          audio: 'eeb162-1-20200604-18600.mp3',
          title: 'Past Lectures',
          comments:
            '<p>Audio recording is from Spring 2017 (date of lecture: 6/8/2017) ... No audio&nbsp;recording&nbsp;from Spring 2018 (6/7/2018)</p>\n',
          type: 'Audio',
          filename: 'eeb162-1-20200604-18600.mp3',
        },
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/02/2020',
          week: 10,
          video: 'eeb162-1-20200602-18599.mp4',
          audio: '',
          title: 'Past Lectures',
          comments: '<svg><g></g></svg>',
          type: 'Video',
          filename: 'eeb162-1-20200602-18599.mp4',
        },
        {
          classShortname: '201C-EEBIOL162-1',
          classID: '128672200',
          term: '201',
          date: '06/02/2020',
          week: 10,
          video: '',
          audio: '',
          title: 'No Lecture Today',
          comments: '<svg><g></g></svg>',
          type: 'None',
          filename: '',
        },
      ],
    },
    {
      _id: '20S-COMSCI32-1',
      listings: [
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/11/2020',
          week: 7,
          video: 'cs32-1-20200511-18380.mp4,cs32-1-20200511-19580.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/14/2012</p>\n',
          type: 'Video',
          filename: 'cs32-1-20200511-18380.mp4, cs32-1-20200511-19580.mp4',
        },
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/06/2020',
          week: 6,
          video: 'cs32-1-20200506-18379.mp4',
          audio: 'cs32-1-20200506-18379.mp3',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/7/2012</p>\n',
          type: 'Audio/Video',
          filename: 'cs32-1-20200506-18379.mp3, cs32-1-20200506-18379.mp4',
        },
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '05/04/2020',
          week: 6,
          video: '',
          audio: 'cs32-1-20200504-18378.mp3',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/5/2012</p>\n',
          type: 'Audio',
          filename: 'cs32-1-20200504-18378.mp3',
        },
      ],
    },
  ];
  expect(formattedArray).toEqual(expectedArray);
  done();
});

afterAll(async done => {
  await client
    .db(process.env.DB_DATABASE)
    .dropCollection(testCrosslistsCollectionName);
  await client.close();
  done();
});
