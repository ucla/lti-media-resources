require('dotenv').config();
const services = require('../services');

const generatedURL = services.generateMediaURL(
  '172.91.84.123',
  '2020s-v/mp4:eeb162-1-20200331-18431.mp4',
  '1594944601',
  '1595034601'
);

const correctURL =
  'https://566f31ddb176b.streamlock.net:443/redirect/2020s-v/mp4:eeb162-1-20200331-18431.mp4?type=m3u8&wowzatokenstarttime=1594944601&wowzatokenendtime=1595034601&wowzatokenhash=4Nlajgn3078W_Em60ldFrkJylbI12668xGGvWcskjas=';

test('Test URL Token Generation', done => {
  expect(generatedURL).toBe(correctURL);
  done();
});
