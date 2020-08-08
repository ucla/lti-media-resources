const MediaQuery = require('../models/mediaquery');

class VideoresServices {
  static async getVideores(label) {
    const docs = await MediaQuery.getVideoResByCourse(label);
    const now = new Date();
    for (const doc of docs) {
      const startDate = new Date(doc.startDate);
      const stopDate = new Date(doc.stopDate);
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
