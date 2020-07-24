require('dotenv').config();
const client = require('./db');

const { DB_DATABASE } = process.env;
const castCollection = client.db(DB_DATABASE).collection('bruincastmedia');
const noticeCollection = client.db(DB_DATABASE).collection('notice');

module.exports.getCastsByCourse = async courseLabel =>
  castCollection.find({ classShortname: courseLabel }).toArray();

module.exports.getCastCountByCourse = async courseLabel => {
  const arrayOfCasts = await this.getCastsByCourse(courseLabel);
  return arrayOfCasts.length;
};

module.exports.getNotice = async () => {
  const noticeArray = await noticeCollection.find({}).toArray();
  return noticeArray[0].notice;
};

module.exports.setNotice = async notice => {
  const ret = await noticeCollection.updateOne({}, { $set: { notice } });
  return ret.result;
};
