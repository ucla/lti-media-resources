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
