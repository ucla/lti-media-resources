require('dotenv').config();
require('babel-polyfill');

const MediaResourceServices = require('../MediaResourceServices');
const constants = require('../../../../constants');

test('Test Token Generation', async done => {
  const generatedToken = await MediaResourceServices.generateMediaToken(
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
  const generatedURL = await MediaResourceServices.generateMediaURL(
    constants.MEDIA_TYPE.BRUINCAST,
    'https://566f31ddb176b.streamlock.net:443/redirect',
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
