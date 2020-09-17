require('dotenv').config();
require('babel-polyfill');

const MediaResourceServices = require('../MediaResourceServices');

test('Test Token Generation', async (done) => {
  const generatedToken = await MediaResourceServices.generateMediaToken(
    '2020s-v/mp4:eeb162-1-20200331-18431.mp4',
    '172.18.0.1',
    'afakesecret',
    '1595365679'
  );
  const correctToken = 'YVNbN1yQoLZdB1iL0-dao8Bjn0emRwZuSPmTw738TtQ=';
  expect(generatedToken).toBe(correctToken);
  done();
});

test('Test URL Generation', async (done) => {
  const generatedURL = await MediaResourceServices.generateMediaURL(
    'https://bclive.oid.ucla.edu',
    '2020s-v/mp4:eeb162-1-20200331-18431.mp4',
    '172.18.0.1',
    'afakesecret',
    '1595365679'
  );
  const correctURL =
    'https://bclive.oid.ucla.edu/2020s-v/mp4:eeb162-1-20200331-18431.mp4/playlist.m3u8?wowzatokenendtime=1595365679&wowzatokenhash=YVNbN1yQoLZdB1iL0-dao8Bjn0emRwZuSPmTw738TtQ=';
  expect(generatedURL).toBe(correctURL);
  done();
});
