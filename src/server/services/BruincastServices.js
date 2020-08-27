const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const MediaQuery = require('../models/mediaquery');
const constants = require('../../../constants');

const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

class BruincastServices {
  static async getNotice() {
    const notice = await MediaQuery.getNotice();
    return dompurify.sanitize(notice);
  }

  static async setNotice(notice) {
    const ret = await MediaQuery.setNotice(notice);
    return ret;
  }

  static async getAllCrosslists(collectionName) {
    const toBeReturned = await MediaQuery.getAllCrosslists(collectionName);
    return toBeReturned;
  }

  static async updateCrosslists(crosslists, collectionName) {
    const numDiff = await MediaQuery.setCrosslists(crosslists, collectionName);
    return numDiff;
  }

  static async getCrosslistByCourse(courseLabel, collectionName) {
    const toBeReturned = await MediaQuery.getCrosslistByCourse(
      courseLabel,
      collectionName
    );
    return toBeReturned;
  }

  static async getCasts(course, userid, isInstructor) {
    const labelList = await this.getCrosslistByCourse(
      course.label,
      'crosslists'
    );
    const courseList = [course];

    for (const label of labelList) {
      courseList.push({
        label,
        quarter: label.split('-')[0],
      });
    }

    const castsByCourses = [];
    for (const c of courseList) {
      const courseCasts = await MediaQuery.getCastsByCourse(
        'bruincastmedia',
        c.label
      );

      if (
        courseCasts &&
        Array.isArray(courseCasts) &&
        courseCasts.length !== 0
      ) {
        const rawPlaybacks = await MediaQuery.getPlaybacks(
          constants.MEDIA_TYPE.BRUINCAST,
          userid,
          c.label,
          'playbacks'
        );

        for (const listObj of courseCasts) {
          for (const cast of listObj.listings) {
            const mediaStr = `${cast.video},${cast.audio}`;
            const mediaArray = mediaStr.split(',');
            const castPlaybackArr = [];
            for (const media of mediaArray) {
              if (media && media !== '') {
                const matchedPlayback = rawPlaybacks.filter(
                  rawPlayback => rawPlayback.file.trim() === media.trim()
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

        if (isInstructor) {
          const rawAnalytics = await MediaQuery.getAnalyticsByCourse(
            constants.MEDIA_TYPE.BRUINCAST,
            c.label,
            'playbacks'
          );
          for (const listingObj of courseCasts) {
            for (const cast of listingObj.listings) {
              const allMediaStr = `${cast.video},${cast.audio}`;
              const allMedias = allMediaStr.trim(',').split(',');
              const castAnalytics = [];
              if (Array.isArray(allMedias) && allMedias.length !== 0) {
                for (const media of allMedias) {
                  const matchedAnalyticsOfMedia = rawAnalytics.filter(
                    analytic => analytic.file === media
                  );
                  for (const matchedAnalytic of matchedAnalyticsOfMedia) {
                    if (!matchedAnalytic.finishedTimes) {
                      matchedAnalytic.finishedTimes = 0;
                    }
                    const userAlreadyInArr = castAnalytics.filter(
                      anaAlreadyIn =>
                        anaAlreadyIn.userid === matchedAnalytic.userid
                    );
                    if (userAlreadyInArr.length === 0) {
                      castAnalytics.push(matchedAnalytic);
                    } else if (
                      matchedAnalytic.finishedTimes >
                        userAlreadyInArr[0].finishedTimes ||
                      (matchedAnalytic.finishedTimes ===
                        userAlreadyInArr[0].finishedTimes &&
                        matchedAnalytic.time > userAlreadyInArr[0].time)
                    ) {
                      userAlreadyInArr[0]._id = matchedAnalytic._id;
                      userAlreadyInArr[0]._file = matchedAnalytic._file;
                      userAlreadyInArr[0].time = matchedAnalytic.time;
                      userAlreadyInArr[0].remaining = matchedAnalytic.remaining;
                      userAlreadyInArr[0].finishedTimes =
                        matchedAnalytic.finishedTimes;
                    }
                  }
                }
              }
              cast.analytics = castAnalytics;
            }
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

  static async getCastListings(term) {
    const termMedia = await MediaQuery.getMediaForTerm('bruincastmedia', term);
    const formattedMedia = this.formatTermCasts(termMedia);
    return formattedMedia;
  }

  static async getAnalytics(course) {
    const labelList = await this.getCrosslistByCourse(
      course.label,
      'crosslists'
    );
    const courseList = [course.label, ...labelList];

    const analyticsByCourse = [];
    for (const c of courseList) {
      const courseCasts = await MediaQuery.getCastsByCourseWithoutAggregation(
        'bruincastmedia',
        c
      );

      if (
        courseCasts &&
        Array.isArray(courseCasts) &&
        courseCasts.length !== 0
      ) {
        const rawAnalytics = await MediaQuery.getAnalyticsByCourse(
          constants.MEDIA_TYPE.BRUINCAST,
          c,
          'playbacks'
        );
        const allUserIds = [];
        for (const rawAnalytic of rawAnalytics) {
          if (!allUserIds.some(userId => userId === rawAnalytic.userid)) {
            allUserIds.push(rawAnalytic.userid);
          }
        }
        const analyticsByUsers = [];
        for (const userid of allUserIds) {
          const analyticsOfUser = [];
          let finishedCount = 0;
          for (const cast of courseCasts) {
            const currMedia = `${cast.video},${cast.audio}`;
            const currTitle = `${cast.title} ${cast.date}`;
            const matchedAnalyticArr = rawAnalytics.filter(
              rawAnalytic =>
                rawAnalytic.userid === userid &&
                currMedia.includes(rawAnalytic.file)
            );
            if (matchedAnalyticArr.length >= 1) {
              let matchedAnalytic;
              matchedAnalyticArr.forEach((currAnalytic, i) => {
                if (!currAnalytic.finishedTimes) {
                  currAnalytic.finishedTimes = 0;
                }
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
            analytics: analyticsOfUser,
            finishedCount,
            totalCount: courseCasts.length,
          });
        }
        const allTitles = courseCasts.map(cast => `${cast.title} ${cast.date}`);
        analyticsByCourse.push({
          course: { label: c },
          analytics: analyticsByUsers,
          allTitles,
        });
      }
    }
    return analyticsByCourse;
  }
}

module.exports = BruincastServices;
