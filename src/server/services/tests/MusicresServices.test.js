require('dotenv').config();
require('babel-polyfill');

const MusicresServices = require('../MusicresServices');
const client = require('../../models/db');
const { COLLECTION_TYPE, collectionMap } = require('../../../../constants');

const { DIGITAL_AUDIO_RESERVES, PLAYBACKS } = COLLECTION_TYPE;

const postfix = 'testmusicresservices';
const testCollections = new Map([
  [
    DIGITAL_AUDIO_RESERVES,
    `${collectionMap.get(DIGITAL_AUDIO_RESERVES)}${postfix}`,
  ],
  [PLAYBACKS, `${collectionMap.get(PLAYBACKS)}${postfix}`],
]);

beforeAll(async done => {
  collectionMap.set(
    DIGITAL_AUDIO_RESERVES,
    testCollections.get(DIGITAL_AUDIO_RESERVES)
  );
  collectionMap.set(PLAYBACKS, testCollections.get(PLAYBACKS));
  await client.connect(process.env.DB_URL);
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

describe('MusicresServices tests', () => {
  test('Test formatAllMusicReservesListings()', async done => {
    const musicReservesListings = [
      {
        _id: {
          shortname: null,
          term: '201',
        },
        subjectArea: null,
        listings: [
          {
            isVideo: true,
            composer: '',
            title: 'Rent (2005 film)',
            performers:
              'Directed by Chris Columbus;\r\nProduced by\tJane Rosenthal,\r\nRobert De Niro,\r\nChris Columbus,\r\nMark Radcliffe,\r\nMichael Barnathan;\r\nScreenplay by\tStephen Chbosky;\r\nBased on\tRent\r\nby Jonathan Larson;\r\nStarring\tRosario Dawson,\r\nTaye Diggs,\r\nWilson Jermaine Heredia,\r\nJesse L. Martin,\r\nIdina Menzel,\r\nAdam Pascal,\r\nAnthony Rapp,\r\nTracie Thoms;\r\nMusic by\tJonathan Larson;\r\nCinematography\tStephen Goldblatt;\r\nEdited by\tRichard Pearson;\r\nProduction\r\ncompany\r\nRevolution Studios,\r\n1492 Pictures,\r\nTribeca Productions;\r\nDistributed by\tColumbia Pictures;\r\nRelease date\r\nNovember 23, 2005',
            noteOne: '',
            noteTwo: '',
            label: '',
            labelCatalogNumber: '',
            callNumber: 'DVD 392',
            items: [
              {
                trackTitle: 'N/A',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd392.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd392.mp4',
              },
            ],
            workID: 8639,
            term: '201',
            srs: '         ',
            classShortname: null,
            subjectArea: null,
          },
          {
            isVideo: true,
            composer: '',
            title: 'Hustle & Flow (2002)',
            performers:
              'Terrence Howard (Djay), Anthony Anderson (Key), Taryn Manning (Nola), Taraji P. Henson (Shug), Paula Jai Parker (Lexus), Elise Neal (Yevette), Isaac Hayes (Arnel), D.J. Qualls (Shelby), Ludacris (Skinny Black)',
            noteOne:
              'Paramount Classics, MTV Films and New Deal Entertainment present ; a Crunk Pictures/Homegrown Pictures production ; written and directed by Craig Brewer ; produced by John Singleton, Stephanie Allain',
            noteTwo:
              'Director of photography, Amelia Vincent ; editor, Billy Fox ; original score by Scott Bomar ; music supervisor, Paul Stewart',
            label: 'Paramount Pictures',
            labelCatalogNumber: '34565',
            callNumber: 'm1192020disc02',
            embedURL: '',
            items: [
              {
                trackTitle: 'N/A',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:m1192020disc02.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/m1192020disc02.mp4',
              },
            ],
            workID: 8964,
            term: '201',
            srs: '         ',
            classShortname: null,
            subjectArea: null,
          },
        ],
      },
      {
        _id: {
          shortname: '201C-MUSCLG68-1',
          term: '201',
        },
        subjectArea: 'MUSCLG',
        listings: [
          {
            isVideo: true,
            composer: '',
            title: 'Yellow Submarine',
            performers: 'The Beatles',
            noteOne: '',
            noteTwo: '',
            label: '',
            labelCatalogNumber: '',
            callNumber: 'DVD 758',
            embedURL: '',
            items: [
              {
                trackTitle: 'Yellow Submarine',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '1',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd758-1.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd758-1.mp4',
              },
            ],
            workID: 8778,
            term: '201',
            srs: '432204200',
            classShortname: '201C-MUSCLG68-1',
            subjectArea: 'MUSCLG',
          },
          {
            isVideo: true,
            composer: '',
            title: "A hard day's night (1964)",
            performers:
              'The Beatles, Wilfrid Brambell, Norman Rossington, Victor Spinetti.',
            noteOne:
              'Miramax Films ; a Walter Shenson production ; original screenplay by Alun Owen ; produced by Walter Shenson ; directed by Richard Lester.',
            noteTwo:
              'Director of photography, Gilbert Taylor ; editor, John Jympson ; musical director, George Martin ; songs by John Lennon, Paul McCartney.  Originally produced as a motion picture in 1964.',
            label: 'Miramax Home Entertainment',
            labelCatalogNumber: '18301',
            callNumber: 'DVD 84',
            items: [
              {
                trackTitle: "A hard day's night",
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd84.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd84.mp4',
              },
            ],
            workID: 8132,
            term: '201',
            srs: '432204200',
            classShortname: '201C-MUSCLG68-1',
            subjectArea: 'MUSCLG',
          },
        ],
      },
    ];

    const formattedMedia = MusicresServices.formatAllMusicReservesListings(
      musicReservesListings
    );

    const expectedMedia = [
      {
        _id: {
          shortname: null,
          term: '201',
        },
        subjectArea: null,
        listings: [
          {
            isVideo: true,
            composer: '',
            title: 'Hustle & Flow (2002)',
            performers:
              'Terrence Howard (Djay), Anthony Anderson (Key), Taryn Manning (Nola), Taraji P. Henson (Shug), Paula Jai Parker (Lexus), Elise Neal (Yevette), Isaac Hayes (Arnel), D.J. Qualls (Shelby), Ludacris (Skinny Black)',
            noteOne:
              'Paramount Classics, MTV Films and New Deal Entertainment present ; a Crunk Pictures/Homegrown Pictures production ; written and directed by Craig Brewer ; produced by John Singleton, Stephanie Allain',
            noteTwo:
              'Director of photography, Amelia Vincent ; editor, Billy Fox ; original score by Scott Bomar ; music supervisor, Paul Stewart',
            label: 'Paramount Pictures',
            labelCatalogNumber: '34565',
            callNumber: 'm1192020disc02',
            embedURL: '',
            items: [
              {
                trackTitle: 'N/A',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:m1192020disc02.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/m1192020disc02.mp4',
              },
            ],
            workID: 8964,
            term: '201',
            srs: '         ',
            classShortname: null,
            subjectArea: null,
          },
          {
            isVideo: true,
            composer: '',
            title: 'Rent (2005 film)',
            performers:
              'Directed by Chris Columbus;\r\nProduced by\tJane Rosenthal,\r\nRobert De Niro,\r\nChris Columbus,\r\nMark Radcliffe,\r\nMichael Barnathan;\r\nScreenplay by\tStephen Chbosky;\r\nBased on\tRent\r\nby Jonathan Larson;\r\nStarring\tRosario Dawson,\r\nTaye Diggs,\r\nWilson Jermaine Heredia,\r\nJesse L. Martin,\r\nIdina Menzel,\r\nAdam Pascal,\r\nAnthony Rapp,\r\nTracie Thoms;\r\nMusic by\tJonathan Larson;\r\nCinematography\tStephen Goldblatt;\r\nEdited by\tRichard Pearson;\r\nProduction\r\ncompany\r\nRevolution Studios,\r\n1492 Pictures,\r\nTribeca Productions;\r\nDistributed by\tColumbia Pictures;\r\nRelease date\r\nNovember 23, 2005',
            noteOne: '',
            noteTwo: '',
            label: '',
            labelCatalogNumber: '',
            callNumber: 'DVD 392',
            items: [
              {
                trackTitle: 'N/A',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd392.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd392.mp4',
              },
            ],
            workID: 8639,
            term: '201',
            srs: '         ',
            classShortname: null,
            subjectArea: null,
          },
        ],
      },
      {
        _id: {
          shortname: '201C-MUSCLG68-1',
          term: '201',
        },
        subjectArea: 'MUSCLG',
        listings: [
          {
            isVideo: true,
            composer: '',
            title: "A hard day's night (1964)",
            performers:
              'The Beatles, Wilfrid Brambell, Norman Rossington, Victor Spinetti.',
            noteOne:
              'Miramax Films ; a Walter Shenson production ; original screenplay by Alun Owen ; produced by Walter Shenson ; directed by Richard Lester.',
            noteTwo:
              'Director of photography, Gilbert Taylor ; editor, John Jympson ; musical director, George Martin ; songs by John Lennon, Paul McCartney.  Originally produced as a motion picture in 1964.',
            label: 'Miramax Home Entertainment',
            labelCatalogNumber: '18301',
            callNumber: 'DVD 84',
            items: [
              {
                trackTitle: "A hard day's night",
                volume: '',
                disc: '',
                side: '',
                trackNumber: '',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd84.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd84.mp4',
              },
            ],
            workID: 8132,
            term: '201',
            srs: '432204200',
            classShortname: '201C-MUSCLG68-1',
            subjectArea: 'MUSCLG',
          },
          {
            isVideo: true,
            composer: '',
            title: 'Yellow Submarine',
            performers: 'The Beatles',
            noteOne: '',
            noteTwo: '',
            label: '',
            labelCatalogNumber: '',
            callNumber: 'DVD 758',
            embedURL: '',
            items: [
              {
                trackTitle: 'Yellow Submarine',
                volume: '',
                disc: '',
                side: '',
                trackNumber: '1',
                httpURL:
                  'https://wowza.library.ucla.edu/audioreserves/definst/mp4:dvd758-1.mp4/playlist.m3u8',
                rtmpURL:
                  'rtmps://wowza.library.ucla.edu/dlp/mp4:audioreserves/dvd758-1.mp4',
              },
            ],
            workID: 8778,
            term: '201',
            srs: '432204200',
            classShortname: '201C-MUSCLG68-1',
            subjectArea: 'MUSCLG',
          },
        ],
      },
    ];

    expect(formattedMedia).toEqual(expectedMedia);
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
});

afterAll(async done => {
  const db = client.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await client.close();
  done();
});
