const MediaQuery = require('../models/mediaquery');
const cache = require('./cache');

class VideoresServices {
  static async getVideores(label) {
    const docs = await MediaQuery.getVideoResByCourse(label);
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
    }
    return docs;
  }
}

module.exports = VideoresServices;
