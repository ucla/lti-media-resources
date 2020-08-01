require('dotenv').config();
require('babel-polyfill');
const client = require('../db');
const { getCastsByTerm } = require('../mediaquery');

const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
const testCollectionName = 'mediaquerytests';

beforeAll(async done => {
  client.connect(dbURL, function() {});
  await client.db(process.env.DB_DATABASE).createCollection(testCollectionName);
  done();
});

test('Test getCastsByTerm', async done => {
  const testData = [
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
      comments:
        '<p>Video recording is from Spring 2017 (date of lecture: 6/6/2017) ... No audio recording from Spring 2018 (6/5/2018)</p>\n',
      timestamp: 1596157102195,
    },
    {
      classShortname: '201-PHYSCI146-1',
      classID: '387576200',
      term: '20S',
      date: '06/04/2020',
      week: '10',
      video: '',
      audio: 'physci146-1-20200604-18567.mp3',
      title: 'Content is from Spring 2019',
      comments: '<p>Date of lecture: June 6, 2019</p>\n',
      timestamp: 1596157107266,
    },
    {
      classShortname: '201-CHEM153B-1',
      classID: '142638200',
      term: '20S',
      date: '06/05/2020',
      week: '10',
      video: 'chem153b-1-20200605-18664.mp4',
      audio: '',
      title: 'Content is from Spring 2019',
      comments: '<p>Date of lecture: June 7, 2019</p>\n',
      timestamp: 1596157112438,
    },
  ];

  await client
    .db(process.env.DB_DATABASE)
    .collection(testCollectionName)
    .insertMany(testData);

  const castsFor20S = await getCastsByTerm(testCollectionName, '20S');
  for (const cast of castsFor20S) {
    expect(cast.term).toEqual('20S');
  }

  const termsFor201 = await getCastsByTerm(testCollectionName, '201');
  for (const cast of termsFor201) {
    expect(cast.term).toEqual('201');
  }

  done();
});

afterAll(async done => {
  await client.db(process.env.DB_DATABASE).dropCollection(testCollectionName);
  await client.close();
  done();
});
