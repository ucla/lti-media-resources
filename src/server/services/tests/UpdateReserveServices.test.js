const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();
require('babel-polyfill');
const UpdateReserveServices = require('../UpdateReserveServices');
const { COLLECTION_TYPE, collectionMap } = require('../../../../constants');

const { VIDEO_RESERVES } = COLLECTION_TYPE;

const dbclient = new MongoClient(process.env.DB_URL, {
  useUnifiedTopology: true,
});

const postfix = 'testupdateservices';
const testCollections = new Map([
  [VIDEO_RESERVES, `${collectionMap.get(VIDEO_RESERVES)}${postfix}`],
]);

beforeAll(async (done) => {
  collectionMap.set(VIDEO_RESERVES, testCollections.get(VIDEO_RESERVES));
  await dbclient.connect();
  const db = dbclient.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.createCollection(col[1]);
  }
  done();
});

test('Generate video fields from bad file', (done) => {
  const stream = fs.createReadStream(
    'src/server/services/tests/fixtures/BAD_TEST_MEDIA_LINKS.txt'
  );
  const warn = jest.fn((warning) => warning);
  const mockLogger = {
    warn,
  };
  let str = '';
  stream.on('data', (data) => {
    str += data.toString();
  });
  stream.on('end', async () => {
    while (
      str.charAt(str.length - 1) === '\r' ||
      str.charAt(str.length - 1) === '\n'
    ) {
      str = str.substr(0, str.length - 1);
    }
    const result = UpdateReserveServices.readStrIntoFields(str, mockLogger);
    expect(warn.mock.calls.length).toBe(9);
    expect(result.length).toBe(9);
  });
  done();
});

test('Generate video fields from good file', (done) => {
  const stream = fs.createReadStream(
    'src/server/services/tests/fixtures/GOOD_TEST_MEDIA_LINKS.txt'
  );
  const warn = jest.fn((warning) => warning);
  const mockLogger = {
    warn,
  };
  let str = '';
  stream.on('data', (data) => {
    str += data.toString();
  });
  stream.on('end', async () => {
    while (
      str.charAt(str.length - 1) === '\r' ||
      str.charAt(str.length - 1) === '\n'
    ) {
      str = str.substr(0, str.length - 1);
    }
    const result = UpdateReserveServices.readStrIntoFields(str, mockLogger);
    expect(warn.mock.calls.length).toBe(0);
    expect(result.length).toBe(3);
  });
  done();
});

test('Update records for class', async (done) => {
  const sampleEntries = [
    {
      term: '99F',
      srs: '69420',
      startDate: '',
      stopDate: '',
      title: 'Film Editing: Overview of History, Technique, and Practice',
      instructor: 'Random Person',
      videoTitle: 'The Graduate',
      videoUrl: '',
      filename: '99F-FILMTV122D-1/TheGraduate.mp4',
      subtitle: '',
      height: '1080',
      width: '1920',
      classShortname: '99F-FILMTV122D-1',
    },
    {
      term: '99F',
      srs: '69420',
      startDate: '',
      stopDate: '',
      title: 'Film Editing: Overview of History, Technique, and Practice',
      instructor: 'Random Person',
      videoTitle: 'Paddington 2',
      videoUrl: '',
      filename: '99F-FILMTV122D-1/Paddington2.mp4',
      subtitle: '',
      height: '1080',
      width: '1920',
      classShortname: '99F-FILMTV122D-1',
    },
  ];
  const numDiff1 = await UpdateReserveServices.updateRecordsForClass(
    dbclient,
    testCollections.get(VIDEO_RESERVES),
    '99F',
    '69420',
    sampleEntries,
    null
  );
  expect(numDiff1).toBe(2);

  const sampleEntry = [
    {
      term: '99F',
      srs: '69420',
      startDate: '',
      stopDate: '',
      title: 'Film Editing: Overview of History, Technique, and Practice',
      instructor: 'Random Person',
      videoTitle: 'Shawshanks Redemption',
      videoUrl: '',
      filename: '99F-FILMTV122D-1/ShawshanksRedemption.mp4',
      subtitle: '',
      height: '1080',
      width: '1920',
      classShortname: '99F-FILMTV122D-1',
    },
  ];
  const numDiff2 = await UpdateReserveServices.updateRecordsForClass(
    dbclient,
    testCollections.get(VIDEO_RESERVES),
    '99F',
    '69420',
    sampleEntry,
    null
  );
  expect(numDiff2).toBe(-1);
  done();
});

afterAll(async (done) => {
  const db = dbclient.db(process.env.DB_DATABASE);
  for (const col of testCollections) {
    await db.dropCollection(col[1]);
  }
  await dbclient.close();
  done();
});
