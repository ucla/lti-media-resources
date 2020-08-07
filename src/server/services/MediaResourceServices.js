const MediaQuery = require('../models/mediaquery');

class MediaResourceServices {
  static async getCounts(courseLabel) {
    let labelList = await MediaQuery.getCrosslistByCourse(
      courseLabel,
      'crosslists'
    );
    labelList = [courseLabel, ...labelList];

    let bruincastCount = 0;
    for (const label of labelList) {
      bruincastCount += await MediaQuery.getCastCountByCourse(
        'bruincastmedia',
        label
      );
    }

    const videoresCount = await MediaQuery.getVideoResCountByCourse(
      courseLabel
    );

    const musicresCount = await MediaQuery.getMusicResCountByCourse(
      courseLabel
    );

    return {
      bruincasts: bruincastCount,
      videos: videoresCount,
      audios: musicresCount,
    };
  }
}

module.exports = MediaResourceServices;
