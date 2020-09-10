require('dotenv').config();
require('babel-polyfill');

const BruincastServices = require('../BruincastServices');
const client = require('../../models/db');

const { COLLECTION_TYPE, collectionMap } = require('../../../../constants');

const { BRUINCAST, CROSSLISTS, PLAYBACKS } = COLLECTION_TYPE;

const postfix = 'testbruincastservices';
const testCollections = new Map([
  [BRUINCAST, `${collectionMap.get(BRUINCAST)}${postfix}`],
  [CROSSLISTS, `${collectionMap.get(CROSSLISTS)}${postfix}`],
  [PLAYBACKS, `${collectionMap.get(PLAYBACKS)}${postfix}`],
]);

beforeAll(async done => {
  collectionMap.set(BRUINCAST, testCollections.get(BRUINCAST));
  collectionMap.set(CROSSLISTS, testCollections.get(CROSSLISTS));
  collectionMap.set(PLAYBACKS, testCollections.get(PLAYBACKS));
  await client.connect(process.env.DB_URL);
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.createCollection(col[1]);
  }
  const sampleCrosslist = {
    list: ['Potions', 'Defence Against the Dark Arts'],
  };
  await db
    .collection(testCollections.get(CROSSLISTS))
    .insertOne(sampleCrosslist);
  const sampleCasts = [
    {
      classShortname: 'Potions',
      video: 'EffectsOfPolyjuicePotions.mp4',
      audio: 'HowToMakePolyjuicePotions.mp3',
      title: 'Polyjuice Potions',
      date: '1992',
    },
    {
      classShortname: 'Potions',
      video: '',
      audio: 'HowToMakeFelixFelicis.mp3',
      title: 'How to Make Felix Felicis',
      date: '1996',
    },
    {
      classShortname: 'Defence Against the Dark Arts',
      video: 'ExpectoPatronum.mp4',
      audio: '',
      title: 'How to Cast the Patronus Charm',
      date: '1993',
    },
  ];
  await db.collection(testCollections.get(BRUINCAST)).insertMany(sampleCasts);
  const samplePlaybacks = [
    {
      classShortname: 'Potions',
      file: 'EffectsOfPolyjuicePotions.mp4',
      mediaType: 0,
      userid: 0,
      finishedTimes: 7,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Potions',
      file: 'EffectsOfPolyjuicePotions.mp4',
      mediaType: 0,
      userid: 2,
      time: 7,
      remaining: 7,
    },
    {
      classShortname: 'Potions',
      file: 'HowToMakePolyjuicePotions.mp3',
      mediaType: 0,
      userid: 0,
      finishedTimes: 1,
      time: 0,
      remaining: 14,
    },
    {
      classShortname: 'Potions',
      file: 'HowToMakeFelixFelicis.mp3',
      mediaType: 0,
      userid: 0,
      finishedTimes: 2,
      time: 0,
      remaining: 0,
    },
    {
      classShortname: 'Potions',
      file: 'HowToMakeFelixFelicis.mp3',
      mediaType: 0,
      userid: 2,
      finishedTimes: 1,
      time: 0,
      remaining: 14,
    },
    {
      classShortname: 'Defence Against the Dark Arts',
      file: 'ExpectoPatronum.mp4',
      mediaType: 0,
      userid: 0,
      time: 0,
      remaining: 14,
    },
    {
      classShortname: 'Defence Against the Dark Arts',
      file: 'ExpectoPatronum.mp4',
      mediaType: 0,
      userid: 2,
      time: 0,
      remaining: 0,
    },
  ];
  await db
    .collection(testCollections.get(PLAYBACKS))
    .insertMany(samplePlaybacks);
  done();
});

describe('BruincastServices tests', () => {
  test('Test formatTermCasts()', async done => {
    const termCasts = [
      {
        _id: {
          shortname: '201C-EEBIOL162-1',
          term: '201',
        },
        subjectArea: 'EE BIOL',
        listings: [
          {
            classShortname: '201C-EEBIOL162-1',
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
        _id: {
          shortname: '20S-COMSCI32-1',
          term: '20S',
        },
        subjectArea: 'COM SCI',
        listings: [
          {
            classShortname: '20S-COMSCI32-1',
            subjectArea: 'COM SCI',
            srs: '187096200',
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
            subjectArea: 'COM SCI',
            srs: '187096200',
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
            subjectArea: 'COM SCI',
            srs: '187096200',
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
        _id: {
          shortname: '201C-EEBIOL162-1',
          term: '201',
        },
        subjectArea: 'EE BIOL',
        listings: [
          {
            classShortname: '201C-EEBIOL162-1',
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
          {
            classShortname: '201C-EEBIOL162-1',
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
            subjectArea: 'EE BIOL',
            srs: '128672200',
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
            classShortname: '20S-COMSCI32-1',
            subjectArea: 'COM SCI',
            srs: '187096200',
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
          {
            classShortname: '20S-COMSCI32-1',
            subjectArea: 'COM SCI',
            srs: '187096200',
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
            subjectArea: 'COM SCI',
            srs: '187096200',
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
        ],
      },
    ];
    expect(formattedArray).toEqual(expectedArray);
    done();
  });

  test('Test Analytics Generation', async done => {
    const sampleCourse = { label: 'Potions' };
    const sampleMembers = [
      { user_id: '0', name: 'Hermione Granger' },
      { user_id: '1', name: 'Ronald Weasley' },
      { user_id: '2', name: 'Neville Longbottom' },
    ];
    const analytics = await BruincastServices.getAnalytics(
      sampleCourse,
      sampleMembers
    );
    const correctAnalytics = [
      {
        course: { label: 'Potions' },
        analytics: [
          {
            userid: 0,
            name: 'Hermione Granger',
            finishedCount: 2,
            totalCount: 2,
            analytics: [
              {
                title: 'Polyjuice Potions  1992',
                finishedTimes: 8,
                time: 7,
                remaining: 7,
              },
              {
                title: 'How to Make Felix Felicis  1996',
                finishedTimes: 2,
                time: 0,
                remaining: 100,
              },
            ],
          },
          {
            userid: 1,
            name: 'Ronald Weasley',
            finishedCount: 0,
            totalCount: 2,
            analytics: [
              {
                title: 'Polyjuice Potions  1992',
                finishedTimes: 0,
                time: 0,
                remaining: 100,
              },
              {
                title: 'How to Make Felix Felicis  1996',
                finishedTimes: 0,
                time: 0,
                remaining: 100,
              },
            ],
          },
          {
            userid: 2,
            name: 'Neville Longbottom',
            finishedCount: 1,
            totalCount: 2,
            analytics: [
              {
                title: 'Polyjuice Potions  1992',
                finishedTimes: 0,
                time: 7,
                remaining: 7,
              },
              {
                title: 'How to Make Felix Felicis  1996',
                finishedTimes: 1,
                time: 0,
                remaining: 14,
              },
            ],
          },
        ],
      },
      {
        course: { label: 'Defence Against the Dark Arts' },
        analytics: [
          {
            userid: 0,
            name: 'Hermione Granger',
            finishedCount: 0,
            totalCount: 1,
            analytics: [
              {
                title: 'How to Cast the Patronus Charm  1993',
                finishedTimes: 0,
                time: 0,
                remaining: 14,
              },
            ],
          },
          {
            userid: 1,
            name: 'Ronald Weasley',
            finishedCount: 0,
            totalCount: 1,
            analytics: [
              {
                title: 'How to Cast the Patronus Charm  1993',
                finishedTimes: 0,
                time: 0,
                remaining: 100,
              },
            ],
          },
          {
            userid: 2,
            name: 'Neville Longbottom',
            finishedCount: 0,
            totalCount: 1,
            analytics: [
              {
                title: 'How to Cast the Patronus Charm  1993',
                finishedTimes: 0,
                time: 0,
                remaining: 100,
              },
            ],
          },
        ],
      },
    ];
    expect(analytics).toMatchObject(correctAnalytics);
    done();
  });

  test('Test Crosslist Services', async done => {
    const sampleData = [
      ['a', 'b', 'c'],
      ['d', 'e'],
    ];
    const updateResult = await BruincastServices.updateCrosslists(sampleData);
    expect(updateResult.updated).toBe(true);
    expect(updateResult.insertedCount).toBe(2);
    expect(updateResult.deletedCount).toBe(1);
    const allLists = await BruincastServices.getAllCrosslists();
    expect(allLists.length).toBe(2);
    expect(allLists[0].length).toBe(3);
    expect(allLists[1].length).toBe(2);
    const oneList = await BruincastServices.getCrosslistByCourse('a');
    expect(oneList.length).toBe(2);
    expect(oneList[0]).toBe('b');
    expect(oneList[1]).toBe('c');
    const deleteResult = await BruincastServices.updateCrosslists([]);
    expect(deleteResult.updated).toBe(true);
    expect(deleteResult.insertedCount).toBe(0);
    expect(deleteResult.deletedCount).toBe(2);
    done();
  });
});

afterAll(async done => {
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await client.close();
  done();
});
