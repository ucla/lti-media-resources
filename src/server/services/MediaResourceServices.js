const MediaQuery = require('../models/mediaquery');

class MediaResourceServices {
  static async getCounts(crosslist) {
    let bruincastCount = 0;
    for (const course of crosslist) {
      const obj = JSON.parse(course);
      bruincastCount += await MediaQuery.getCastCountByCourse(obj.label);
    }
    return {
      bruincasts: bruincastCount,
      videos: 69,
      audios: 420,
    };
  }
}

module.exports = MediaResourceServices;
