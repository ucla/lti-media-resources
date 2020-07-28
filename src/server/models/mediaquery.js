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

module.exports.getCastsByTerm = async academicTerm => {
  const recordsForTerm = await client
    .db(DB_DATABASE)
    .collection('bruincastmedia')
    .find({ term: academicTerm })
    .toArray();
  return recordsForTerm;
};

module.exports.getAllBruinCastMedia = async function() {
  const allRecords = await client
    .db(DB_DATABASE)
    .collection('bruincastmedia')
    .find({})
    .toArray();
  return allRecords;
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

// Write queries for crosslists here
// module.exports.getCrosslists
// module.exports.setCrosslists
