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

      const rawPlaybacks = await MediaQuery.getPlaybacks(
        constants.TAB_BRUINCAST,
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
    return castsByCourses;
  }

  static formatCastListings(castEntries) {
    const formattedArray = [];
    let currentShortname = '';
    let currentListings = [];
    for (const [i, entry] of castEntries.entries()) {
      const entryClassShortname = entry.classShortname;

      let filetype = 'Audio/Video';
      let file = '';
      if (entry.video === '' && entry.audio === '') {
        filetype = 'None';
      } else if (entry.video === '') {
        filetype = 'Audio';
        file = entry.audio;
      } else if (entry.audio === '') {
        filetype = 'Video';
        file = entry.video;
      } else {
        file = `${entry.audio}, ${entry.video}`;
      }

      const formattedEntry = {
        term: entry.term,
        classID: entry.classID,
        week: entry.week,
        date: entry.date,
        title: entry.title,
        comments: dompurify.sanitize(entry.comments),
        type: filetype,
        filename: file,
      };

      if (i === 0) {
        currentShortname = entryClassShortname;
      }

      if (entryClassShortname !== currentShortname) {
        formattedArray.push({
          courseShortname: currentShortname,
          courseListings: currentListings,
        });
        currentListings = [];
        currentShortname = entryClassShortname;
      }

      currentListings.push(formattedEntry);

      if (i === castEntries.length - 1) {
        formattedArray.push({
          courseShortname: currentShortname,
          courseListings: currentListings,
        });
      }
    }

    return formattedArray;
  }

  static async getCastListings(term) {
    const media = await MediaQuery.getCastsByTerm('bruincastmedia', term);
    const formattedArray = this.formatCastListings(media);
    return formattedArray;
  }
}

module.exports = BruincastServices;
