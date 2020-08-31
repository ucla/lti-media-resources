require('dotenv').config();
const client = require('./db');

const { DB_DATABASE } = process.env;

module.exports.getCastsByCourse = async (dbCollection, courseLabel) => {
  /*
   * Aggregation Steps:
   * 1. Match by courseShortname
   * 2. Sort course records by date in ascending order
   * 3. Group records by $week field
   * 4. Sort the groups by week number in ascending order
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
      $group: {
        _id: '$week',
        listings: {
          $push: {
            _id: '$_id',
            date: '$date',
            video: '$video',
            audio: '$audio',
            title: '$title',
            comments: '$comments',
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
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

module.exports.getCastsByCourseWithoutAggregation = async (
  dbCollection,
  courseLabel
) => {
  const bcastCollection = client.db(DB_DATABASE).collection(dbCollection);
  const toBeReturned = await bcastCollection
    .find({ classShortname: courseLabel })
    .sort({ date: 1 })
    .toArray();
  return toBeReturned;
};

module.exports.getCastCountByCourse = async (dbCollection, courseLabel) => {
  const castCount = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .find({ classShortname: courseLabel })
    .count();
  return castCount;
};

module.exports.getMediaGroupedByShortname = async dbCollection => {
  /*
   * This aggregation groups media records by shortname and term.
   * Grouping by both fields separates records with null shortname into groups by term.
   */
  const aggregation = [
    {
      $group: {
        _id: {
          shortname: '$classShortname',
          term: '$term',
        },
        subjectArea: {
          $first: '$subjectArea',
        },
        listings: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $sort: {
        term: 1,
        _id: 1,
      },
    },
  ];

  const termMedia = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .aggregate(aggregation)
    .toArray();
  return termMedia;
};

module.exports.getTerms = async dbCollection => {
  const terms = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .distinct('term');

  return terms;
};

module.exports.getSubjectAreasForTerm = async (dbCollection, term) => {
  const query = term !== '' ? { term } : {};
  const subjectAreasArray = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .distinct('subjectArea', query);

  return subjectAreasArray;
};

module.exports.getVideoResByCourse = async courseLabel => {
  const videoResCollection = client.db(DB_DATABASE).collection('videoreserves');
  const toBeReturned = await videoResCollection
    .find({ classShortname: courseLabel })
    .sort({ videoTitle: 1 })
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

module.exports.getMusicResByCourse = async courseLabel => {
  const musicResCollection = client.db(DB_DATABASE).collection('musicreserves');
  const toBeReturned = await musicResCollection
    .find({ classShortname: courseLabel })
    .sort({ title: 1 })
    .toArray();
  return toBeReturned;
};

module.exports.getMusicResCountByCourse = async courseLabel => {
  const arrayOfMusicRes = await this.getMusicResByCourse(courseLabel);
  let totalItemCount = 0;
  for (const album of arrayOfMusicRes) {
    if (album.items && Array.isArray(album.items)) {
      totalItemCount += album.items.length;
    }
  }
  return totalItemCount;
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

module.exports.updatePlayback = async (obj, collectionName) => {
  const playbackCollection = client.db(DB_DATABASE).collection(collectionName);
  const {
    userid,
    mediaType,
    file,
    classShortname,
    time,
    remaining,
    finished,
  } = obj;
  const filter = {
    userid,
    mediaType,
    file,
    classShortname,
  };
  const update = {
    $set: { userid, mediaType, file, classShortname, time, remaining },
  };
  if (finished) {
    update.$inc = { finishedTimes: 1 };
  }
  const result = await playbackCollection.updateOne(filter, update, {
    upsert: true,
  });
  return result.result.ok;
};

module.exports.getPlaybacks = async (
  mediaType,
  userid,
  courseLabel,
  collectionName
) => {
  const playbackCollection = client.db(DB_DATABASE).collection(collectionName);
  const query = { mediaType, userid, classShortname: courseLabel };
  const toBeReturned = await playbackCollection.find(query).toArray();
  return toBeReturned;
};

module.exports.getAnalyticsByCourse = async (
  mediaType,
  courseLabel,
  collectionName
) => {
  const playbackCollection = client.db(DB_DATABASE).collection(collectionName);
  const query = { mediaType, classShortname: courseLabel };
  const toBeReturned = await playbackCollection.find(query).toArray();
  return toBeReturned;
};
