require('dotenv').config();
const client = require('./db');

const { DB_DATABASE } = process.env;

module.exports.getCastsByCourse = async (dbCollection, courseLabel) => {
  /*
   * Aggregation Steps:
   * 1. Match by courseLabel
   * 2. Sort course records by date in ascending order
   * 3. Group buckets of records by 'week' field
   *
   * The boundaries have an inclusive lowerbound and exclusive upperbound,
   * so 89 is needed in the boundaries so that casts with week 88 can be
   * grouped properly in [88, 89).
   *
   * Reference: https://docs.mongodb.com/manual/reference/operator/aggregation/bucket/#examples
   */
  const aggregation = [
    {
      $match: {
        classShortname: courseLabel,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
    {
      $bucket: {
        groupBy: '$week',
        boundaries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 88, 89],
        default: 99,
        output: {
          listings: {
            $push: {
              date: '$date',
              video: '$video',
              audio: '$audio',
              title: '$title',
              comments: '$comments',
            },
          },
        },
      },
    },
  ];

  const courseCasts = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .aggregate(aggregation)
    .toArray();

  return courseCasts;
};

module.exports.getCastCountByCourse = async (dbCollection, courseLabel) => {
  const castCount = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .find({ classShortname: courseLabel })
    .count();
  return castCount;
};

module.exports.getCastsByTerm = async (dbCollection, academicTerm) => {
  let query = {};
  if (academicTerm !== '') {
    query = { term: academicTerm };
  }

  const recordsForTerm = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .find(query)
    .toArray();
  return recordsForTerm;
};

module.exports.getVideoResByCourse = async courseLabel => {
  const videoResCollection = client.db(DB_DATABASE).collection('videoreserves');
  const toBeReturned = await videoResCollection
    .find({ classShortname: courseLabel })
    .toArray();
  return toBeReturned;
};

module.exports.getVideoResCountByCourse = async courseLabel => {
  const resCount = await client
    .db(DB_DATABASE)
    .collection('videoreserves')
    .find({ classShortname: courseLabel })
    .count();
  return resCount;
};

module.exports.getNotice = async () => {
  const noticeCollection = client.db(DB_DATABASE).collection('notice');
  const noticeArray = await noticeCollection.find({}).toArray();
  return noticeArray[0].notice;
};

module.exports.setNotice = async notice => {
  const noticeCollection = client.db(DB_DATABASE).collection('notice');
  const ret = await noticeCollection.updateOne({}, { $set: { notice } });
  return ret.result;
};

module.exports.getAllCrosslists = async collectionName => {
  const crosslistCollection = client.db(DB_DATABASE).collection(collectionName);
  const raw = await crosslistCollection.find({}).toArray();
  const toBeReturned = [];
  for (const obj of raw) {
    if (obj.list && Array.isArray(obj.list)) {
      toBeReturned.push(obj.list);
    }
  }
  return toBeReturned;
};

module.exports.getCrosslistByCourse = async (courseLabel, collectionName) => {
  const arrayOfLists = await module.exports.getAllCrosslists(collectionName);
  let toBeReturned = [];
  for (const list of arrayOfLists) {
    if (list && Array.isArray(list) && list.includes(courseLabel)) {
      const toBeAppended = list.filter(label => label !== courseLabel);
      toBeReturned = [...toBeReturned, ...toBeAppended];
    }
  }
  return toBeReturned;
};

module.exports.setCrosslists = async (crosslists, collectionName) => {
  const crosslistCollection = client.db(DB_DATABASE).collection(collectionName);
  const session = client.client.startSession();
  session.startTransaction();
  try {
    const deleteResult = await crosslistCollection.deleteMany({}, { session });
    const { deletedCount } = deleteResult;
    let insertedCount = 0;
    for (const list of crosslists) {
      const insertResult = await crosslistCollection.insertMany([{ list }], {
        session,
      });
      insertedCount += insertResult.insertedCount;
    }
    await session.commitTransaction();
    session.endSession();
    return { deletedCount, insertedCount, updated: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
