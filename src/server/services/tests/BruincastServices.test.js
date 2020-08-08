require('dotenv').config();
require('babel-polyfill');

const BruincastServices = require('../BruincastServices');
const client = require('../../models/db');

const testCollectionName = 'crossliststests';

beforeAll(async done => {
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  await client.connect(dbURL);
  await client.db(process.env.DB_DATABASE).createCollection(testCollectionName);
  done();
});

test('Test Crosslist Services', async done => {
  const sampleData = [
    ['a', 'b', 'c'],
    ['d', 'e'],
  ];
  const updateResult = await BruincastServices.updateCrosslists(
    sampleData,
    testCollectionName
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
    testCollectionName
  );
  expect(oneList.length).toBe(2);
  expect(oneList[0]).toBe('b');
  expect(oneList[1]).toBe('c');
  const deleteResult = await BruincastServices.updateCrosslists(
    [],
    testCollectionName
  );
  expect(deleteResult.updated).toBe(true);
  expect(deleteResult.insertedCount).toBe(0);
  expect(deleteResult.deletedCount).toBe(2);
  done();
});

test('Test formatting cast listings', async done => {
  const testDataArray = [
    {
      classShortname: '201-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '05/11/2020',
      week: '7',
      video: 'cs32-1-20200511-18380.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 3/14/2012</p>\n',
      timestamp: 1596157098921,
    },
    {
      classShortname: '201-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '05/06/2020',
      week: '6',
      video: 'cs32-1-20200506-18379.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 3/7/2012</p>\n',
      timestamp: 1596157099135,
    },
    {
      classShortname: '201-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '05/04/2020',
      week: '6',
      video: 'cs32-1-20200504-18378.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 3/5/2012</p>\n',
      timestamp: 1596157099334,
    },
    {
      classShortname: '201C-EEBIOL162-1',
      classID: '128672200',
      term: '201',
      date: '06/04/2020',
      week: '10',
      video: 'eeb162-1-20200604-18600.mp4',
      audio: '',
      title: 'Past Lectures',
      comments:
        '<p>Video recording is from Spring 2017 (date of lecture: 6/8/2017) ... No audio recording from Spring 2018 (6/7/2018)</p>\n',
      timestamp: 1596157101968,
    },
    {
      classShortname: '201C-EEBIOL162-1',
      classID: '128672200',
      term: '201',
      date: '06/02/2020',
      week: '10',
      video: 'eeb162-1-20200602-18599.mp4',
      audio: '',
      title: 'Past Lectures',
      comments: '<svg><g/onload=alert(2)//<p>',
      timestamp: 1596157102195,
    },
  ];
  const formattedArray = BruincastServices.formatCastListings(testDataArray);
  const expectedArray = [
    {
      courseShortname: '201-COMSCI32-1',
      courseListings: [
        {
          term: '20S',
          classID: '187096200',
          date: '05/11/2020',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/14/2012</p>\n',
          type: 'Video',
          filename: 'cs32-1-20200511-18380.mp4',
        },
        {
          term: '20S',
          classID: '187096200',
          date: '05/06/2020',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/7/2012</p>\n',
          type: 'Video',
          filename: 'cs32-1-20200506-18379.mp4',
        },
        {
          term: '20S',
          classID: '187096200',
          date: '05/04/2020',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 3/5/2012</p>\n',
          type: 'Video',
          filename: 'cs32-1-20200504-18378.mp4',
        },
      ],
    },
    {
      courseShortname: '201C-EEBIOL162-1',
      courseListings: [
        {
          term: '201',
          classID: '128672200',
          date: '06/04/2020',
          title: 'Past Lectures',
          comments:
            '<p>Video recording is from Spring 2017 (date of lecture: 6/8/2017) ... No audio&nbsp;recording&nbsp;from Spring 2018 (6/7/2018)</p>\n',
          type: 'Video',
          filename: 'eeb162-1-20200604-18600.mp4',
        },
        {
          term: '201',
          classID: '128672200',
          date: '06/02/2020',
          title: 'Past Lectures',
          comments: '<svg><g></g></svg>',
          type: 'Video',
          filename: 'eeb162-1-20200602-18599.mp4',
        },
      ],
    },
  ];
  expect(formattedArray).toEqual(expectedArray);
  done();
});

afterAll(async done => {
  await client.db(process.env.DB_DATABASE).dropCollection(testCollectionName);
  await client.close();
  done();
});
