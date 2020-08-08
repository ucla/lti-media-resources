const MediaQuery = require('../models/mediaquery');

class MusicresServices {
  static async getMusicres(label) {
    const docs = await MediaQuery.getMusicResByCourse(label);
    for (const doc of docs) {
      let combinedNote = doc.noteOne ? doc.noteOne : '';
      if (doc.noteTwo && doc.noteTwo !== '') {
        if (!combinedNote || combinedNote === '') {
          combinedNote = doc.noteTwo;
        } else {
          combinedNote += `\n${doc.noteTwo}`;
        }
      }
      doc.notes = combinedNote;
    }
    return docs;
  }
}

module.exports = MusicresServices;
