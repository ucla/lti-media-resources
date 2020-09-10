require('dotenv').config();
require('babel-polyfill');
const client = require('../db');
const {
  getCastsByCourse,
  getCastCountByCourse,
  getMediaGroupedByShortname,
} = require('../mediaquery');

const { COLLECTION_TYPE, collectionMap } = require('../../../../constants');

const { BRUINCAST } = COLLECTION_TYPE;

const postfix = 'testmediaquery';
const testCollections = new Map([
  [BRUINCAST, `${collectionMap.get(BRUINCAST)}${postfix}`],
]);

const testData = [
  {
    _id: '100',
    classShortname: '20S-COMSCI32-1',
    subjectArea: 'COM SCI',
    srs: '187096200',
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
    subjectArea: 'COM SCI',
    srs: '187096200',
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
    subjectArea: 'COM SCI',
    srs: '187096200',
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
    subjectArea: 'EE BIOL',
    srs: '128672200',
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
    subjectArea: 'EE BIOL',
    srs: '128672200',
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
    classShortname: '20S-PHYSCI146-1',
    subjectArea: 'PHYSCI',
    srs: '387576200',
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
    classShortname: '20S-CHEM153B-1',
    subjectArea: 'CHEM',
    srs: '142638200',
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
  collectionMap.set(BRUINCAST, testCollections.get(BRUINCAST));
  await client.connect(process.env.DB_URL);
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.createCollection(col[1]);
  }
  await db.collection(testCollections.get(BRUINCAST)).insertMany(testData);
  done();
});

test('Test getCastsByCourse', async done => {
  // Expect the returned casts to be bucketed by week
  try {
    const castsFor201CS32 = await getCastsByCourse('20S-COMSCI32-1');

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
    const castCountFor201CS32 = await getCastCountByCourse('20S-COMSCI32-1');
    expect(castCountFor201CS32).toEqual(3);

    const castCountFor201EEBIOL162 = await getCastCountByCourse(
      '201C-EEBIOL162-1'
    );
    expect(castCountFor201EEBIOL162).toEqual(2);

    done();
  } catch (error) {
    done(error);
  }
});

test('Test getMediaGroupedByShortname', async done => {
  try {
    const groupedMedia = await getMediaGroupedByShortname(
      testCollections.get(BRUINCAST)
    );

    const expectedMedia = [
      {
        _id: {
          shortname: '201C-EEBIOL162-1',
          term: '201',
        },
        subjectArea: 'EE BIOL',
        listings: [
          {
            _id: '103',
            classShortname: '201C-EEBIOL162-1',
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
        ],
      },
      {
        _id: {
          shortname: '20S-CHEM153B-1',
          term: '20S',
        },
        subjectArea: 'CHEM',
        listings: [
          {
            _id: '106',
            classShortname: '20S-CHEM153B-1',
            subjectArea: 'CHEM',
            srs: '142638200',
            term: '20S',
            date: '06/05/2020',
            week: 10,
            video: 'chem153b-1-20200605-18664.mp4',
            audio: '',
            title: 'Content is from Spring 2019',
            comments: '<p>Date of lecture: June 7, 2019</p>\n',
            timestamp: 1596157112438,
          },
        ],
      },
      {
        _id: {
          shortname: '20S-COMSCI32-1',
          term: '20S',
        },
        subjectArea: 'COM SCI',
        listings: [
          {
            _id: '100',
            classShortname: '20S-COMSCI32-1',
            subjectArea: 'COM SCI',
            srs: '187096200',
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
            subjectArea: 'COM SCI',
            srs: '187096200',
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
            subjectArea: 'COM SCI',
            srs: '187096200',
            term: '20S',
            date: '05/06/2020',
            week: 6,
            video: 'cs32-1-20200506-18379.mp4',
            audio: '',
            title: 'Content is from CS 32 (Winter 2012)',
            comments: '<p>Date of lecture: 3/7/2012</p>\n',
            timestamp: 1596157099135,
          },
        ],
      },
      {
        _id: {
          shortname: '20S-PHYSCI146-1',
          term: '20S',
        },
        subjectArea: 'PHYSCI',
        listings: [
          {
            _id: '105',
            classShortname: '20S-PHYSCI146-1',
            subjectArea: 'PHYSCI',
            srs: '387576200',
            term: '20S',
            date: '06/04/2020',
            week: 10,
            video: '',
            audio: 'physci146-1-20200604-18567.mp3',
            title: 'Content is from Spring 2019',
            comments: '<p>Date of lecture: June 6, 2019</p>\n',
            timestamp: 1596157107266,
          },
        ],
      },
    ];

    expect(groupedMedia).toEqual(expectedMedia);

    done();
  } catch (error) {
    done(error);
  }
});

afterAll(async done => {
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await client.close();
  done();
});
