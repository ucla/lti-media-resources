const MediaQuery = require('../models/mediaquery');
const cache = require('./cache');
const {
  MEDIA_TYPE,
  COLLECTION_TYPE,
  collectionMap,
} = require('../../../constants');

class VideoresServices {
  /**
   * Retrieve video reserves of a course
   *
   * @param {string} label  Label of course to query for
   * @param {number} userid  User that made this query request
   * @returns {Array}   Return video reserves of the course.
   */
  static async getVideores(label, userid) {
    const docs = await MediaQuery.getVideoResByCourse(label);
    const rawPlaybacks = await MediaQuery.getPlaybacks(
      MEDIA_TYPE.VIDEO_RESERVES,
      userid,
      label
    );
    const now = new Date();
    for (const doc of docs) {
      let startDate = cache.get(doc.startDate);
      if (startDate === undefined) {
        startDate = new Date(doc.startDate);
        cache.set(doc.startDate, startDate);
      }

      let stopDate = cache.get(doc.stopDate);
      if (stopDate === undefined) {
        stopDate = new Date(doc.stopDate);
        cache.set(doc.stopDate, stopDate);
      }

      if (startDate < now && stopDate > now) {
        doc.expired = false;
      } else {
        delete doc.videoUrl;
        delete doc.filename;
        delete doc.subtitle;
        delete doc.height;
        delete doc.width;
        doc.expired = true;
      }

      const matchedPlayback = rawPlaybacks.filter(
        rawPlayback => rawPlayback.file === doc.filename
      );
      if (matchedPlayback.length === 1) {
        doc.playback = matchedPlayback[0].time;
        doc.remaining = matchedPlayback[0].remaining;
        doc.finished = matchedPlayback[0].finishedTimes;
      } else {
        doc.playback = null;
        doc.remaining = null;
        doc.finished = null;
      }
    }
    return docs;
  }

  /**
   * Retrieve all video reserves
   *
   * @returns {Array}   Return all video reserves.
   */
  static async getAllVideoReserves() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      collectionMap.get(COLLECTION_TYPE.VIDEO_RESERVES)
    );
    return termMedia;
  }

  /**
   * Retrieve all playback histories of all students
   *
   * @param {object} course  Course to query for.
   * @param {Array} members  Array of all students.
   * @returns {Array}   Return all playback histories of all students.
   */
  static async getAnalytics(course, members) {
    const allMedias = await MediaQuery.getVideoResByCourse(course.label);
    const rawAnalytics = await MediaQuery.getAnalyticsByCourse(
      MEDIA_TYPE.VIDEO_RESERVES,
      course.label
    );
    // Declare an empty array to push in final results
    // The array contains objects organized like this:
    // First level objects: analytics of each user
    //   {name: string, userid: number, finishedCount: number, totalCount: number, analytics: array of second level objects}
    // Second level objects: playback history of a media
    //   {title: string, finishedTimes: number, time: number, remaining: number}
    const analyticsByUsers = [];
    // Create a first level object for each user
    for (const userObj of members) {
      const { user_id: idStr, name } = userObj;
      const userid = parseInt(idStr);
      // Declare an array of second level objects
      const analyticsOfUser = [];
      let finishedCount = 0;
      // Create a second level object for each media
      for (const media of allMedias) {
        const matchedAnalyticArr = rawAnalytics.filter(
          a => a.userid === userid && a.file === media.filename
        );
        // If user has watched this media before, modify playback history and push to result
        if (matchedAnalyticArr.length >= 1) {
          if (!matchedAnalyticArr[0].finishedTimes) {
            matchedAnalyticArr[0].finishedTimes = 0;
          }
          if (matchedAnalyticArr[0].finishedTimes > 0) {
            finishedCount += 1;
          }
          delete matchedAnalyticArr[0]._id;
          delete matchedAnalyticArr[0].classShortname;
          delete matchedAnalyticArr[0].mediaType;
          matchedAnalyticArr[0].title = media.videoTitle;
          if (
            matchedAnalyticArr[0].time === 0 &&
            matchedAnalyticArr[0].remaining === 0
          ) {
            matchedAnalyticArr[0].remaining = 100;
          }
          analyticsOfUser.push(matchedAnalyticArr[0]);
          // If user has not watched this media before, create an analytic with no progress
        } else {
          analyticsOfUser.push({
            title: media.videoTitle,
            time: 0,
            remaining: 100,
            finishedTimes: 0,
          });
        }
      }
      analyticsByUsers.push({
        userid,
        name,
        analytics: analyticsOfUser,
        finishedCount,
        totalCount: allMedias.length,
      });
    }
    return analyticsByUsers;
  }
}

module.exports = VideoresServices;
