require('dotenv').config();
require('babel-polyfill');

require('dotenv').config();

const BruincastServices = require('../BruincastServices');
const client = require('../../models/db');

const testCollectionName = 'crossliststests';

beforeAll(async done => {
  const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
  await client.connect(dbURL);
  await client.db(process.env.DB_DATABASE).createCollection(testCollectionName);
  done();
});

test('Test Crosslist Services', async done => {
  const sampleData = [
    ['a', 'b', 'c'],
    ['d', 'e'],
  ];
  const updateResult = await BruincastServices.updateCrosslists(
    sampleData,
    testCollectionName
  );
  expect(updateResult.updated).toBe(true);
  expect(updateResult.insertedCount).toBe(2);
  expect(updateResult.deletedCount).toBe(0);
  const allLists = await BruincastServices.getAllCrosslists('crossliststests');
  expect(allLists.length).toBe(2);
  expect(allLists[0].length).toBe(3);
  expect(allLists[1].length).toBe(2);
  const oneList = await BruincastServices.getCrosslistByCourse(
    'a',
    testCollectionName
  );
  expect(oneList.length).toBe(2);
  expect(oneList[0]).toBe('b');
  expect(oneList[1]).toBe('c');
  const deleteResult = await BruincastServices.updateCrosslists(
    [],
    testCollectionName
  );
  expect(deleteResult.updated).toBe(true);
  expect(deleteResult.insertedCount).toBe(0);
  expect(deleteResult.deletedCount).toBe(2);
  done();
});

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

afterAll(async done => {
  await client.db(process.env.DB_DATABASE).dropCollection(testCollectionName);
  await client.close();
  done();
});
