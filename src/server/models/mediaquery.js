require('dotenv').config();
const client = require('./db');

const { COLLECTION_TYPE, collectionMap } = require('../../../constants');

const {
  BRUINCAST,
  VIDEO_RESERVES,
  DIGITAL_AUDIO_RESERVES,
  CROSSLISTS,
  PLAYBACKS,
  NOTICE,
} = COLLECTION_TYPE;

const { DB_DATABASE } = process.env;

/**
 * Retrieve all bruincast contents of a course, aggregated by week
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {Array}   Return all bruincast contents of a course, aggregated.
 */
module.exports.getCastsByCourse = async courseLabel => {
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
    .collection(collectionMap.get(BRUINCAST))
    .aggregate(aggregation)
    .toArray();

  return courseCasts;
};

/**
 * Retrieve all bruincast contents of a course, not aggregated
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {Array}   Return all bruincast contents of a course, not aggregated.
 */
module.exports.getCastsByCourseWithoutAggregation = async courseLabel => {
  const bcastCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(BRUINCAST));
  const toBeReturned = await bcastCollection
    .find({ classShortname: courseLabel })
    .sort({ date: 1 })
    .toArray();
  return toBeReturned;
};

/**
 * Retrieve the number of bruincast contents of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {number}   Return the number of bruincast contents of a course.
 */
module.exports.getCastCountByCourse = async courseLabel => {
  const castCount = await client
    .db(DB_DATABASE)
    .collection(collectionMap.get(BRUINCAST))
    .find({ classShortname: courseLabel })
    .count();
  return castCount;
};

/**
 * Retrieve all medias of a media type, grouped by course
 *
 * @param {string} dbCollection  The database collection to look for the medias, usually indicating media type.
 * @returns {Array}   Return all medias in dbCollection, grouped by course.
 */
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

/**
 * Retrieve the terms a database collection has
 *
 * @param {string} dbCollection  The database collection to look for terms, usually indicating media type.
 * @returns {Array}   Return all terms dbCollection has.
 */
module.exports.getTerms = async dbCollection => {
  const terms = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .distinct('term');

  return terms;
};

/**
 * Retrieve the subject areas a database collection has for a term
 *
 * @param {string} dbCollection  The database collection to look for terms, usually indicating media type.
 * @param {string} term  Term to query for.
 * @returns {Array}   Return all subject areas dbCollection has for term.
 */
module.exports.getSubjectAreasForTerm = async (dbCollection, term) => {
  const query = term !== '' ? { term } : {};
  const subjectAreasArray = await client
    .db(DB_DATABASE)
    .collection(dbCollection)
    .distinct('subjectArea', query);

  return subjectAreasArray;
};

/**
 * Retrieve video reserves of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {Array}   Return video reserves of the course.
 */
module.exports.getVideoResByCourse = async courseLabel => {
  const videoResCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(VIDEO_RESERVES));
  const toBeReturned = await videoResCollection
    .find({ classShortname: courseLabel })
    .sort({ videoTitle: 1 })
    .toArray();
  return toBeReturned;
};

/**
 * Retrieve the number of video reserves of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {number}   Return the number of video reserves of a course.
 */
module.exports.getVideoResCountByCourse = async courseLabel => {
  const resCount = await client
    .db(DB_DATABASE)
    .collection(collectionMap.get(VIDEO_RESERVES))
    .find({ classShortname: courseLabel })
    .count();
  return resCount;
};

/**
 * Retrieve music reserves of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {Array}   Return music reserves of the course.
 */
module.exports.getMusicResByCourse = async courseLabel => {
  const musicResCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(DIGITAL_AUDIO_RESERVES));
  const toBeReturned = await musicResCollection
    .find({ classShortname: courseLabel })
    .sort({ title: 1 })
    .toArray();
  return toBeReturned;
};

/**
 * Retrieve the number of music reserves of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {number}   Return the number of music reserves of a course.
 */
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

/**
 * Retrieve bruincast notice
 * (Notice is in HTML format)
 *
 * @returns {string}   Returns notice (not sanitized yet).
 */
module.exports.getNotice = async () => {
  const noticeCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(NOTICE));
  const noticeArray = await noticeCollection.find({}).toArray();
  return noticeArray[0].notice;
};

/**
 * Set bruincast notice in database
 * (Notice is in HTML format)
 *
 * @param {string} notice  Notice to be set (should be already sanitized).
 * @returns {object}   Returns status of database insertion (success or failure).
 */
module.exports.setNotice = async notice => {
  const noticeCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(NOTICE));
  const ret = await noticeCollection.updateOne({}, { $set: { notice } });
  return ret.result;
};

/**
 * Retrieve crosslist
 *
 * @returns {Array}   Returns all crosslists.
 */
module.exports.getAllCrosslists = async () => {
  const crosslistCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(CROSSLISTS));
  const raw = await crosslistCollection.find({}).toArray();
  const toBeReturned = [];
  for (const obj of raw) {
    if (obj.list && Array.isArray(obj.list)) {
      toBeReturned.push(obj.list);
    }
  }
  return toBeReturned;
};

/**
 * Retrieve crosslist of a course
 *
 * @param {string} courseLabel  Label of course to query for.
 * @returns {Array}   Returns crosslists that contains courseLabel.
 */
module.exports.getCrosslistByCourse = async courseLabel => {
  const arrayOfLists = await module.exports.getAllCrosslists(
    collectionMap.get(CROSSLISTS)
  );
  let toBeReturned = [];
  for (const list of arrayOfLists) {
    if (list && Array.isArray(list) && list.includes(courseLabel)) {
      const toBeAppended = list.filter(label => label !== courseLabel);
      toBeReturned = [...toBeReturned, ...toBeAppended];
    }
  }
  return toBeReturned;
};

/**
 * Set crosslists in database
 *
 * @param {Array} crosslists  Crosslists to be set.
 * @returns {number}   Returns number of crosslists inserted minus deleted.
 */
module.exports.setCrosslists = async crosslists => {
  const crosslistCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(CROSSLISTS));
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

/**
 * Update a playback history in database
 *
 * @param {object} obj  Object that contains all playback fields to be updated.
 * @returns {number}   Returns status of update (success or failure).
 */
module.exports.updatePlayback = async obj => {
  const playbackCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(PLAYBACKS));
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

/**
 * Retrieve playbacks of a specific course, user, and media type
 *
 * @param {number} mediaType  Media type to query for.
 * @param {number} userid  User to query for.
 * @param {string} courseLabel Label of course to query for.
 * @returns {Array}   Returns playbacks of mediaType, userid, and courseLabel.
 */
module.exports.getPlaybacks = async (mediaType, userid, courseLabel) => {
  const playbackCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(PLAYBACKS));
  const query = { mediaType, userid, classShortname: courseLabel };
  const toBeReturned = await playbackCollection.find(query).toArray();
  return toBeReturned;
};

/**
 * Retrieve all playbacks of a specific course and media type for all users
 *
 * @param {number} mediaType  Media type to query for.
 * @param {string} courseLabel Label of course to query for.
 * @returns {Array}   Returns playbacks of mediaType, userid, and courseLabel.
 */
module.exports.getAnalyticsByCourse = async (mediaType, courseLabel) => {
  const playbackCollection = client
    .db(DB_DATABASE)
    .collection(collectionMap.get(PLAYBACKS));
  const query = { mediaType, classShortname: courseLabel };
  const toBeReturned = await playbackCollection.find(query).toArray();
  return toBeReturned;
};
