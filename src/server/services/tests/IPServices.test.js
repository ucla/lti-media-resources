const { isOnCampusIP } = require('../IPServices');

test('Test on-campus IPs', async done => {
  expect(isOnCampusIP('128.97.0.1')).toEqual(true);
  expect(isOnCampusIP('131.179.0.1')).toEqual(true);
  expect(isOnCampusIP('149.142.0.1')).toEqual(true);
  expect(isOnCampusIP('164.67.0.1')).toEqual(true);
  expect(isOnCampusIP('169.232.0.1')).toEqual(true);
  expect(isOnCampusIP('172.16.0.1')).toEqual(true);
  expect(isOnCampusIP('192.35.210.1')).toEqual(true);
  expect(isOnCampusIP('192.35.225.0')).toEqual(true);
  expect(isOnCampusIP('192.154.2.1')).toEqual(true);
  expect(isOnCampusIP('2607:F010:3FC:1C:0:0:0:9')).toEqual(true);

  done();
});

test('Test off-campus IPs', async done => {
  expect(isOnCampusIP('128.96.0.1')).toEqual(false);
  expect(isOnCampusIP('132.179.0.1')).toEqual(false);
  expect(isOnCampusIP('141.142.0.1')).toEqual(false);
  expect(isOnCampusIP('161.67.0.1')).toEqual(false);
  expect(isOnCampusIP('168.232.0.1')).toEqual(false);
  expect(isOnCampusIP('172.161.0.1')).toEqual(false);
  expect(isOnCampusIP('191.35.210.1')).toEqual(false);
  expect(isOnCampusIP('197.35.225.0')).toEqual(false);
  expect(isOnCampusIP('192.159.2.1')).toEqual(false);
  expect(isOnCampusIP('2606:F011:4ED:1B:0:0:0:3')).toEqual(false);

  done();
});
