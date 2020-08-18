require('dotenv').config();
require('babel-polyfill');
const client = require('../db');
const {
  getCastsByCourse,
  getCastCountByCourse,
  getMediaForTerm,
} = require('../mediaquery');

const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
const testCollectionName = 'mediaquerytests';
const testData = [
  {
    _id: '100',
    classShortname: '20S-COMSCI32-1',
    classID: '187096200',
    term: '20S',
    date: '06/02/2020',
    week: 10,
    video: 'cs32-1-20200511-18380.mp4',
    audio: '',
    title: 'Content is from CS 32 (Winter 2012)',
    comments: '<p>Date of lecture: 3/14/2012</p>\n',
    timestamp: 1596157098921,
  },
  {
    _id: '101',
    classShortname: '20S-COMSCI32-1',
    classID: '187096200',
    term: '20S',
    date: '05/11/2020',
    week: 7,
    video: 'cs32-1-20200511-18380.mp4',
    audio: '',
    title: 'Content is from CS 32 (Winter 2012)',
    comments: '<p>Date of lecture: 3/14/2012</p>\n',
    timestamp: 1596157098921,
  },
  {
    _id: '102',
    classShortname: '20S-COMSCI32-1',
    classID: '187096200',
    term: '20S',
    date: '05/06/2020',
    week: 6,
    video: 'cs32-1-20200506-18379.mp4',
    audio: '',
    title: 'Content is from CS 32 (Winter 2012)',
    comments: '<p>Date of lecture: 3/7/2012</p>\n',
    timestamp: 1596157099135,
  },
  {
    _id: '103',
    classShortname: '201C-EEBIOL162-1',
    classID: '128672200',
    term: '201',
    date: '06/04/2020',
    week: 10,
    video: 'eeb162-1-20200604-18600.mp4',
    audio: '',
    title: 'Past Lectures',
    comments:
      '<p>Video recording is from Spring 2017 (date of lecture: 6/8/2017) ... No audio recording from Spring 2018 (6/7/2018)</p>\n',
    timestamp: 1596157101968,
  },
  {
    _id: '104',
    classShortname: '201C-EEBIOL162-1',
    classID: '128672200',
    term: '201',
    date: '06/02/2020',
    week: 10,
    video: 'eeb162-1-20200602-18599.mp4',
    audio: '',
    title: 'Past Lectures',
    comments:
      '<p>Video recording is from Spring 2017 (date of lecture: 6/6/2017) ... No audio recording from Spring 2018 (6/5/2018)</p>\n',
    timestamp: 1596157102195,
  },
  {
    _id: '105',
    classShortname: '201-PHYSCI146-1',
    classID: '387576200',
    term: '20S',
    date: '06/04/2020',
    week: 10,
    video: '',
    audio: 'physci146-1-20200604-18567.mp3',
    title: 'Content is from Spring 2019',
    comments: '<p>Date of lecture: June 6, 2019</p>\n',
    timestamp: 1596157107266,
  },
  {
    _id: '106',
    classShortname: '201-CHEM153B-1',
    classID: '142638200',
    term: '20S',
    date: '06/05/2020',
    week: 10,
    video: 'chem153b-1-20200605-18664.mp4',
    audio: '',
    title: 'Content is from Spring 2019',
    comments: '<p>Date of lecture: June 7, 2019</p>\n',
    timestamp: 1596157112438,
  },
];

beforeAll(async done => {
  client.connect(dbURL, function() {});
  await client.db(process.env.DB_DATABASE).createCollection(testCollectionName);

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
      '20S-COMSCI32-1',
      'true'
    );

    const expectedCasts = [
      {
        _id: 6,
        listings: [
          {
            _id: '102',
            date: '05/06/2020',
            video: 'cs32-1-20200506-18379.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/7/2012</p>\n',
          },
        ],
      },
      {
        _id: 7,
        listings: [
          {
            _id: '101',
            date: '05/11/2020',
            video: 'cs32-1-20200511-18380.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/14/2012</p>\n',
          },
        ],
      },
      {
        _id: 10,
        listings: [
          {
            _id: '100',
            date: '06/02/2020',
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
      '20S-COMSCI32-1'
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

test('Test getMediaForTerm 20S', async done => {
  try {
    const mediaFor20S = await getMediaForTerm(testCollectionName, '20S');
    for (const courseMedia of mediaFor20S) {
      for (const entry of courseMedia.listings) {
        expect(entry.term).toEqual('20S');
      }
    }
    done();
  } catch (error) {
    done(error);
  }
});

test('Test getMediaForTerm 201', async done => {
  try {
    const mediaFor20S = await getMediaForTerm(testCollectionName, '201');
    for (const courseMedia of mediaFor20S) {
      for (const entry of courseMedia.listings) {
        expect(entry.term).toEqual('201');
      }
    }
    done();
  } catch (error) {
    done(error);
  }
});

test('Test getMediaForTerm All', async done => {
  try {
    const mediaFor20S = await getMediaForTerm(testCollectionName, '');
    let listingsCount = 0;
    for (const courseMedia of mediaFor20S) {
      listingsCount += courseMedia.listings.length;
    }
    expect(listingsCount).toEqual(testData.length);
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
