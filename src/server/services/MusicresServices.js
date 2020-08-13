const MediaQuery = require('../models/mediaquery');
const constants = require('../../../constants');

class MusicresServices {
  static async getMusicres(label, userid) {
    const docs = await MediaQuery.getMusicResByCourse(label);
    const rawPlaybacks = await MediaQuery.getPlaybacks(
      constants.TAB_DIGITAL_AUDIO_RESERVES,
      userid,
      label,
      'playbacks'
    );
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
      for (const item of doc.items) {
        const matchedPlayback = rawPlaybacks.filter(
          rawPlayback => rawPlayback.file.trim() === item.httpURL.trim()
        );
        if (matchedPlayback.length === 1) {
          item.playback = matchedPlayback[0].time;
        } else {
          item.playback = null;
        }
      }
    }
    return docs;
  }
}

module.exports = MusicresServices;
