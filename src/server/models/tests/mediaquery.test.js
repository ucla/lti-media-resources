require('dotenv').config();
require('babel-polyfill');
const client = require('../db');
const {
  getCastsByCourse,
  getCastCountByCourse,
  getCastsByTerm,
} = require('../mediaquery');

const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
const testCollectionName = 'mediaquerytests';

beforeAll(async done => {
  client.connect(dbURL, function() {});
  await client.db(process.env.DB_DATABASE).createCollection(testCollectionName);

  const testData = [
    {
      classShortname: '201-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '06/02/2020',
      week: '10',
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

  done();
});

test('Test getCastsByCourse', async done => {
  // Expect the returned casts to be bucketed by week
  try {
    const castsFor201CS32 = await getCastsByCourse(
      testCollectionName,
      '201-COMSCI32-1'
    );

    const expectedCasts = [
      {
        _id: '10',
        listings: [
          {
            date: '06/02/2020',
            video: 'cs32-1-20200511-18380.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/14/2012</p>\n',
          },
        ],
      },
      {
        _id: '6',
        listings: [
          {
            date: '05/06/2020',
            video: 'cs32-1-20200506-18379.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/7/2012</p>\n',
          },
        ],
      },
      {
        _id: '7',
        listings: [
          {
            date: '05/11/2020',
            video: 'cs32-1-20200511-18380.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/14/2012</p>\n',
          },
        ],
      },
    ];

    expect(castsFor201CS32).toEqual(expectedCasts);
    done();
  } catch (error) {
    done(error);
  }
});

test('Test getCastCountByCourse', async done => {
  try {
    const castCountFor201CS32 = await getCastCountByCourse(
      testCollectionName,
      '201-COMSCI32-1'
    );
    expect(castCountFor201CS32).toEqual(3);

    const castCountFor201EEBIOL162 = await getCastCountByCourse(
      testCollectionName,
      '201C-EEBIOL162-1'
    );
    expect(castCountFor201EEBIOL162).toEqual(2);

    done();
  } catch (error) {
    done(error);
  }
});

test('Test getCastsByTerm 20S', async done => {
  // Expect the returned casts to all have term 20S
  try {
    const castsFor20S = await getCastsByTerm(testCollectionName, '20S');
    for (const cast of castsFor20S) {
      expect(cast.term).toEqual('20S');
    }
    done();
  } catch (error) {
    done(error);
  }
});

test('Test getCastsByTerm 201', async done => {
  // Expect the returned casts to all have term 201
  try {
    const castsFor201 = await getCastsByTerm(testCollectionName, '201');
    for (const cast of castsFor201) {
      expect(cast.term).toEqual('201');
    }
    done();
  } catch (error) {
    done(error);
  }
});

test('Test getCastsByTerm All', async done => {
  try {
    // Expect all casts to be returned
    const castsForAllTerms = await getCastsByTerm(testCollectionName, '');
    expect(castsForAllTerms.length).toEqual(7);
    done();
  } catch (error) {
    done(error);
  }
});

afterAll(async done => {
  await client.db(process.env.DB_DATABASE).dropCollection(testCollectionName);
  client.close();
  done();
});
