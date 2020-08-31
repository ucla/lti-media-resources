const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const MediaQuery = require('../models/mediaquery');
const { sortAcademicTerms } = require('./utility');
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

  static async getCasts(course, userid) {
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

  static async getCastListings() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      'bruincastmedia'
    );
    const formattedMedia = this.formatTermCasts(termMedia);
    return formattedMedia;
  }

  static async getTerms() {
    const terms = await MediaQuery.getTerms('bruincastmedia');
    const sortedTerms = sortAcademicTerms(terms, true);
    return sortedTerms;
  }

  static async getSubjectAreasForTerm(term) {
    const subjectAreas = await MediaQuery.getSubjectAreasForTerm(
      'bruincastmedia',
      term
    );
    return subjectAreas;
  }
}

module.exports = BruincastServices;
