const MediaQuery = require('../models/mediaquery');
const {
  MEDIA_TYPE,
  COLLECTION_TYPE,
  collectionMap,
} = require('../../../constants');

class MusicresServices {
  /**
   * Retrieve music reserves of a course
   *
   * @param {string} courseSISID  courseSISID of course to query for
   * @param {number} userid  User that made this query request
   * @returns {Array}   Return music reserves of the course.
   */
  static async getMusicres(courseSISID, userid) {
    const docs = await MediaQuery.getMusicResByCourse(courseSISID);
    const rawPlaybacks = await MediaQuery.getPlaybacks(
      MEDIA_TYPE.DIGITAL_AUDIO_RESERVES,
      userid,
      courseSISID
    );
    for (const doc of docs) {
      let combinedNote = doc.noteOne ? doc.noteOne : '';
      if (doc.noteTwo && doc.noteTwo !== '') {
        if (!combinedNote || combinedNote === '') {
          combinedNote = doc.noteTwo;
        } else {
          combinedNote += `\n${doc.noteTwo}`;
        }
      }
      doc.notes = combinedNote;
      for (const item of doc.items) {
        const matchedPlayback = rawPlaybacks.filter(
          (rawPlayback) => rawPlayback.file.trim() === item.httpURL.trim()
        );
        if (matchedPlayback.length === 1) {
          item.playback = matchedPlayback[0].time;
          item.remaining = matchedPlayback[0].remaining;
          item.finished = matchedPlayback[0].finishedTimes;
        } else {
          item.playback = null;
          item.remaining = null;
          item.finished = null;
        }
      }
    }
    return docs;
  }

  /**
   * Retrieve all music reserves
   *
   * @returns {Array}   Return all music reserves.
   */
  static async getAllMusicReserves() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      collectionMap.get(COLLECTION_TYPE.DIGITAL_AUDIO_RESERVES)
    );
    return termMedia;
  }

  /**
   * Retrieve all playback histories of all students
   *
   * @param {string} courseSISID  courseSISID to query for.
   * @param {Array} members  Array of all students.
   * @returns {Array}   Return all playback histories of all students.
   */
  static async getAnalytics(courseSISID, members) {
    const allAlbums = await MediaQuery.getMusicResByCourse(courseSISID);
    const allTracks = [];
    for (const album of allAlbums) {
      for (const track of album.items) {
        allTracks.push({
          title: `${album.title} - ${track.trackTitle}`,
          file: track.httpURL,
        });
      }
    }
    const rawAnalytics = await MediaQuery.getAnalyticsByCourse(
      MEDIA_TYPE.DIGITAL_AUDIO_RESERVES,
      courseSISID
    );
    // Declare an empty array to push in final results
    // The array contains objects organized like this:
    // First level objects: analytics of each user
    //   {name: string, userid: number, finishedCount: number, totalCount: number, analytics: array of second level objects}
    // Second level objects: playback history of a track
    //   {title: string, finishedTimes: number, time: number, remaining: number}
    const analyticsByUsers = [];
    // Create a first level object for each user
    for (const userObj of members) {
      const { user_id: idStr, name } = userObj;
      const userid = parseInt(idStr);
      // Declare an array of second level objects
      const analyticsOfUser = [];
      let finishedCount = 0;
      // Create a second level object for each track
      for (const track of allTracks) {
        const matchedAnalyticArr = rawAnalytics.filter(
          (a) => a.userid === userid && a.file === track.file
        );
        // If user has watched this track before, modify playback history and push to result
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
          matchedAnalyticArr[0].title = track.title;
          if (
            matchedAnalyticArr[0].time === 0 &&
            matchedAnalyticArr[0].remaining === 0
          ) {
            matchedAnalyticArr[0].remaining = 100;
          }
          analyticsOfUser.push(matchedAnalyticArr[0]);
          // If user has not watched this track before, create an analytic with no progress
        } else {
          analyticsOfUser.push({
            title: track.title,
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
        totalCount: allTracks.length,
      });
    }
    return analyticsByUsers;
  }
}

module.exports = MusicresServices;
