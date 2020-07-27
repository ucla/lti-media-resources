const MediaQuery = require('../models/mediaquery');

class MediaResourceServices {
  static async getCounts(courseLabel) {
    // First, get crosslist
    const labelList = [courseLabel, '20S-MATH33B-1'];

    let bruincastCount = 0;
    for (const label of labelList) {
      bruincastCount += await MediaQuery.getCastCountByCourse(label);
    }
    return {
      bruincasts: bruincastCount,
      videos: 69,
      audios: 420,
    };
  }
}

module.exports = MediaResourceServices;
