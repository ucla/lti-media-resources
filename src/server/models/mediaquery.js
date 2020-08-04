require('dotenv').config();
const client = require('./db');

const { DB_DATABASE } = process.env;

module.exports.getCastsByCourse = async courseLabel => {
  const castCollection = client.db(DB_DATABASE).collection('bruincastmedia');
  const toBeReturned = await castCollection
    .find({ classShortname: courseLabel })
    .toArray();
  return toBeReturned;
};

module.exports.getCastCountByCourse = async courseLabel => {
  const arrayOfCasts = await this.getCastsByCourse(courseLabel);
  return arrayOfCasts.length;
};

module.exports.getVideoResByCourse = async courseLabel => {
  const videoResCollection = client.db(DB_DATABASE).collection('videoreserves');
  const toBeReturned = await videoResCollection
    .find({ classShortname: courseLabel })
    .toArray();
  return toBeReturned;
};

module.exports.getVideoResCountByCourse = async courseLabel => {
  const arrayOfVideoRes = await this.getVideoResByCourse(courseLabel);
  return arrayOfVideoRes.length;
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

module.exports.getAllCrosslists = async () => {
  const crosslistCollection = client.db(DB_DATABASE).collection('crosslists');
  const raw = await crosslistCollection.find({}).toArray();
  const toBeReturned = [];
  for (const obj of raw) {
    if (obj.list && Array.isArray(obj.list)) {
      toBeReturned.push(obj.list);
    }
  }
  return toBeReturned;
};

module.exports.getCrosslistByCourse = async courseLabel => {
  const arrayOfLists = await this.getAllCrosslists();
  let toBeReturned = [];
  for (const list of arrayOfLists) {
    if (list && Array.isArray(list) && list.includes(courseLabel)) {
      const toBeAppended = list.filter(label => label !== courseLabel);
      toBeReturned = [...toBeReturned, ...toBeAppended];
    }
  }
  return toBeReturned;
};

module.exports.setCrosslists = async crosslists => {
  const crosslistCollection = client.db(DB_DATABASE).collection('crosslists');
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
