const MediaQuery = require('../models/mediaquery');
const cache = require('./cache');
const { compareAcademicTerms } = require('./utility');
const constants = require('../../../constants');

class VideoresServices {
  static async getVideores(label, userid) {
    const docs = await MediaQuery.getVideoResByCourse(label);
    const rawPlaybacks = await MediaQuery.getPlaybacks(
      constants.MEDIA_TYPE.VIDEO_RESERVES,
      userid,
      label,
      'playbacks'
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

  static async getAllVideoReserves() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      'videoreserves'
    );
    return termMedia;
  }
}

module.exports = VideoresServices;
