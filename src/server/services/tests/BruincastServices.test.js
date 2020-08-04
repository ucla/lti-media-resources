require('dotenv').config();
require('babel-polyfill');

const BruincastServices = require('../BruincastServices');

test('Test Token Generation', async done => {
  const generatedToken = await BruincastServices.generateMediaToken(
    '2020s-v/mp4:eeb162-1-20200331-18431.mp4',
    '172.18.0.1',
    'afakesecret69420',
    '1595275679',
    '1595365679'
  );
  const correctToken = '21m26u_t6BykDG7PTuUWhoob3LJ-KzoZvKTkh9EgQ0k=';
  expect(generatedToken).toBe(correctToken);
  done();
});

test('Test URL Generation', async done => {
  const generatedURL = await BruincastServices.generateMediaURL(
    '566f31ddb176b.streamlock.net',
    '2020s-v/mp4:eeb162-1-20200331-18431.mp4',
    '172.18.0.1',
    'afakesecret69420',
    '1595275679',
    '1595365679'
  );
  const correctURL =
    'https://566f31ddb176b.streamlock.net:443/redirect/2020s-v/mp4:eeb162-1-20200331-18431.mp4?type=m3u8&wowzatokenstarttime=1595275679&wowzatokenendtime=1595365679&wowzatokenhash=21m26u_t6BykDG7PTuUWhoob3LJ-KzoZvKTkh9EgQ0k=';
  expect(generatedURL).toBe(correctURL);
  done();
});

test('Test grouping casts by week', async done => {
  const castsArray = [
    {
      classShortname: '20S-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '03/30/2020',
      week: '1',
      video: 'cs32-1-20200330-18368.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 1/9/2012</p>\n',
      timestamp: 1596157100750,
    },
    {
      classShortname: '20S-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '04/13/2020',
      week: '3',
      video: 'cs32-1-20200413-18372.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 2/1/2012</p>\n',
      timestamp: 1596157100548,
    },
    {
      classShortname: '20S-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '04/15/2020',
      week: '3',
      video: 'cs32-1-20200415-18373.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 2/13/2012</p>\n',
      timestamp: 1596157100345,
    },
    {
      classShortname: '20S-COMSCI32-1',
      classID: '187096200',
      term: '20S',
      date: '04/20/2020',
      week: '4',
      video: 'cs32-1-20200420-18374.mp4',
      audio: '',
      title: 'Content is from CS 32 (Winter 2012)',
      comments: '<p>Date of lecture: 2/15/2012</p>\n',
      timestamp: 1596157100140,
    },
  ];

  const expectedGrouping = [
    {
      week: '1',
      listings: [
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '03/30/2020',
          week: '1',
          video: 'cs32-1-20200330-18368.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 1/9/2012</p>\n',
          timestamp: 1596157100750,
        },
      ],
    },
    {
      week: '3',
      listings: [
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '04/13/2020',
          week: '3',
          video: 'cs32-1-20200413-18372.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 2/1/2012</p>\n',
          timestamp: 1596157100548,
        },
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '04/15/2020',
          week: '3',
          video: 'cs32-1-20200415-18373.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 2/13/2012</p>\n',
          timestamp: 1596157100345,
        },
      ],
    },
    {
      week: '4',
      listings: [
        {
          classShortname: '20S-COMSCI32-1',
          classID: '187096200',
          term: '20S',
          date: '04/20/2020',
          week: '4',
          video: 'cs32-1-20200420-18374.mp4',
          audio: '',
          title: 'Content is from CS 32 (Winter 2012)',
          comments: '<p>Date of lecture: 2/15/2012</p>\n',
          timestamp: 1596157100140,
        },
      ],
    },
  ];

  const groupedCasts = BruincastServices.groupCastsByWeek(castsArray);
  expect(groupedCasts).toEqual(expectedGrouping);
  done();
});
