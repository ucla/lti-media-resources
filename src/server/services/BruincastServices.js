const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const MediaQuery = require('../models/mediaquery');
const {
  MEDIA_TYPE,
  COLLECTION_TYPE,
  collectionMap,
} = require('../../../constants');

const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

class BruincastServices {
  /**
   * Retrieve bruincast notice from database
   * (Notice is in HTML format)
   *
   * @returns {string}   Returns sanitized notice.
   */
  static async getNotice() {
    const notice = await MediaQuery.getNotice();
    return dompurify.sanitize(notice);
  }

  /**
   * Set bruincast notice in database
   * (Notice is in HTML format)
   *
   * @param {string} notice  Notice to be set.
   * @returns {object}   Returns status of database insertion (success or failure).
   */
  static async setNotice(notice) {
    const ret = await MediaQuery.setNotice(dompurify.sanitize(notice));
    return ret;
  }

  /**
   * Retrieve crosslist from database
   *
   * @returns {Array}   Returns all crosslists.
   */
  static async getAllCrosslists() {
    const toBeReturned = await MediaQuery.getAllCrosslists();
    return toBeReturned;
  }

  /**
   * Set crosslists in database
   *
   * @param {Array} crosslists  Crosslists to be set.
   * @returns {number}   Returns number of crosslists inserted minus deleted.
   */
  static async updateCrosslists(crosslists) {
    const numDiff = await MediaQuery.setCrosslists(crosslists);
    return numDiff;
  }

  /**
   * Retrieve crosslist of a course from database
   *
   * @param {string} courseLabel  Label of course to query for.
   * @returns {Array}   Returns crosslists that contains courseLabel.
   */
  static async getCrosslistByCourse(courseLabel) {
    const toBeReturned = await MediaQuery.getCrosslistByCourse(courseLabel);
    return toBeReturned;
  }

  /**
   * Retrieve all bruincast contents from database
   *
   * @param {object} course  Course object to query for.
   * @param {number} userid  User who made this query request.
   * @returns {Array}   Returns all bruincast contents, including all crosslisted courses.
   */
  static async getCasts(course, userid) {
    const labelList = await this.getCrosslistByCourse(course.label);
    const courseList = [course];

    for (const label of labelList) {
      courseList.push({
        label,
        quarter: label.split('-')[0],
      });
    }

    const castsByCourses = [];
    for (const c of courseList) {
      const courseCasts = await MediaQuery.getCastsByCourse(c.label);

      if (
        courseCasts &&
        Array.isArray(courseCasts) &&
        courseCasts.length !== 0
      ) {
        const rawPlaybacks = await MediaQuery.getPlaybacks(
          MEDIA_TYPE.BRUINCAST,
          userid,
          c.label
        );

        for (const listObj of courseCasts) {
          for (const cast of listObj.listings) {
            const mediaStr = `${cast.video},${cast.audio}`;
            const mediaArray = mediaStr.split(',');
            const castPlaybackArr = [];
            for (const media of mediaArray) {
              if (media && media !== '') {
                const matchedPlayback = rawPlaybacks.filter(
                  (rawPlayback) => rawPlayback.file.trim() === media.trim()
                );
                if (matchedPlayback.length === 1) {
                  castPlaybackArr.push({
                    file: media.trim(),
                    playback: matchedPlayback[0].time,
                    remaining: matchedPlayback[0].remaining,
                    finished: matchedPlayback[0].finishedTimes,
                  });
                }
              }
            }
            cast.playbackArr = castPlaybackArr;
          }
        }

        castsByCourses.push({
          course: c,
          casts: courseCasts,
        });
      }
    }
    return castsByCourses;
  }

  /**
   * Update bruincast media entries with clean fields.
   *
   * @param {Array} media  Media entries to be updated.
   * @returns {Array}   Formatted media entries.
   */
  static formatTermCasts(media) {
    for (const courseMedia of media) {
      for (const entry of courseMedia.listings) {
        let filetype = 'Audio/Video';
        let file = '';

        // Video and audio strings can be formatted as 'xxx.mp4,yyy.mp4'
        // Replace ',' to add a space after the comma for better display
        const entryVideos = entry.video.replace(',', ', ');
        const entryAudios = entry.audio.replace(',', ', ');
        if (entryVideos === '' && entryAudios === '') {
          filetype = 'None';
        } else if (entryVideos === '') {
          filetype = 'Audio';
          file = entryAudios;
        } else if (entryAudios === '') {
          filetype = 'Video';
          file = entryVideos;
        } else {
          file = `${entryAudios}, ${entryVideos}`;
        }

        entry.type = filetype;
        entry.filename = file;
        entry.comments = dompurify.sanitize(entry.comments);
        delete entry._id;
        delete entry.timestamp;
      }
    }

    return media;
  }

  /**
   * Retrieve all bruincast media grouped by course for admin panel
   *
   * @returns {Array}   Return all bruincast medias grouped by course.
   */
  static async getCastListings() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      collectionMap.get(COLLECTION_TYPE.BRUINCAST)
    );
    const formattedMedia = this.formatTermCasts(termMedia);
    return formattedMedia;
  }

  /**
   * Retrieve all playback histories of all students
   *
   * @param {object} course  Course to query for.
   * @param {Array} members  Array of all students.
   * @returns {Array}   Return all playback histories of all students.
   */
  static async getAnalytics(course, members) {
    const labelList = await this.getCrosslistByCourse(course.label);
    const courseList = [course.label, ...labelList];

    // The following codes format analytics into the following format
    // Top level (Course Level): { course: object, this course's analytics: array of second level }
    // Second level (User Level):
    //   { userid: number, name: string, this user's analytics: array of third level, finishedCount: number, totalCount: number }
    // Third level (Media Level): { title of media: string, finishedTimes: number, time: number, remaining: number }
    const analyticsByCourse = [];
    for (const c of courseList) {
      const courseCasts = await MediaQuery.getCastsByCourseWithoutAggregation(
        c
      );

      if (
        courseCasts &&
        Array.isArray(courseCasts) &&
        courseCasts.length !== 0
      ) {
        // Retrieving all playback histories of course from database
        const rawAnalytics = await MediaQuery.getAnalyticsByCourse(
          MEDIA_TYPE.BRUINCAST,
          c
        );
        // Declare an array of second level objects
        const analyticsByUsers = [];
        // Push a second level object into the above array for each user
        for (const userObj of members) {
          const { user_id: idStr, name } = userObj;
          const userid = parseInt(idStr);
          // Declare an array of third level objects
          const analyticsOfUser = [];
          let finishedCount = 0;
          // For each bruincast entry, push a third level object into the above array
          for (const cast of courseCasts) {
            const currMedia = `${cast.video},${cast.audio}`;
            const currTitle = `${cast.title}  ${cast.date}`;
            // Find if the user have watched the bruincast entry
            const matchedAnalyticArr = rawAnalytics.filter(
              (rawAnalytic) =>
                rawAnalytic.userid === userid &&
                currMedia.includes(rawAnalytic.file)
            );
            // If the user have watched it, modify its playback history and push into array
            if (matchedAnalyticArr.length >= 1) {
              let matchedAnalytic;
              let totalWatchedTimes = 0;
              matchedAnalyticArr.forEach((currAnalytic, i) => {
                if (!currAnalytic.finishedTimes) {
                  currAnalytic.finishedTimes = 0;
                }
                totalWatchedTimes += currAnalytic.finishedTimes;
                if (
                  i === 0 ||
                  currAnalytic.finishedTimes > matchedAnalytic.finishedTimes ||
                  (currAnalytic.finishedTimes ===
                    matchedAnalytic.finishedTimes &&
                    currAnalytic.time > matchedAnalytic.time)
                ) {
                  matchedAnalytic = currAnalytic;
                }
              });
              matchedAnalytic.finishedTimes = totalWatchedTimes;
              if (matchedAnalytic.finishedTimes > 0) {
                finishedCount += 1;
              }
              delete matchedAnalytic._id;
              delete matchedAnalytic.classShortname;
              delete matchedAnalytic.mediaType;
              matchedAnalytic.title = currTitle;
              if (
                matchedAnalytic.time === 0 &&
                matchedAnalytic.remaining === 0
              ) {
                matchedAnalytic.remaining = 100;
              }
              analyticsOfUser.push(matchedAnalytic);
              // If the user has not watched the media, push a third level object with 0 progress
            } else {
              analyticsOfUser.push({
                title: currTitle,
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
            totalCount: courseCasts.length,
          });
        }
        analyticsByCourse.push({
          course: { label: c },
          analytics: analyticsByUsers,
        });
      }
    }
    return analyticsByCourse;
  }
}

module.exports = BruincastServices;
