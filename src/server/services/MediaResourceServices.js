const MediaQuery = require('../models/mediaquery');

class MediaResourceServices {
  static async getCounts(courseLabel) {
    let labelList = await MediaQuery.getCrosslistByCourse(courseLabel);
    labelList = [courseLabel, ...labelList];

    let bruincastCount = 0;
    for (const label of labelList) {
      bruincastCount += await MediaQuery.getCastCountByCourse(label);
    }

    const videoresCount = await MediaQuery.getVideoResCountByCourse(
      courseLabel
    );

    return {
      bruincasts: bruincastCount,
      videos: videoresCount,
      audios: 420,
    };
  }
}

module.exports = MediaResourceServices;
