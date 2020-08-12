const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const MediaQuery = require('../models/mediaquery');

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

  static async getCasts(course) {
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

      castsByCourses.push({
        course: c,
        casts: courseCasts,
      });
    }
    return castsByCourses;
  }

  static formatTermCasts(media) {
    for (const courseMedia of media) {
      for (const entry of courseMedia.listings) {
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
}

module.exports = BruincastServices;
