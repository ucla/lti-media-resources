const MediaQuery = require('../models/mediaquery');

class MusicresServices {
  static async getMusicres(label) {
    const docs = await MediaQuery.getMusicResByCourse(label);
    return docs;
  }
}

module.exports = MusicresServices;
