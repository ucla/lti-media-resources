const MediaQuery = require('../models/mediaquery');
const { compareAcademicTerms } = require('./utility');
const constants = require('../../../constants');

class MusicresServices {
  static async getMusicres(label, userid) {
    const docs = await MediaQuery.getMusicResByCourse(label);
    const rawPlaybacks = await MediaQuery.getPlaybacks(
      constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES,
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
          item.remaining = matchedPlayback[0].remaining;
          item.finished = matchedPlayback[0].finishedTimes;
        } else {
          item.playback = null;
          item.remaining = null;
          item.finished = null;
        }
      }
    }
    return docs;
  }

  static async getAllMusicReserves() {
    const termMedia = await MediaQuery.getMediaGroupedByShortname(
      'musicreserves'
    );
    return termMedia;
  }

  static async getTerms() {
    const terms = await MediaQuery.getTerms('musicreserves');
    terms.sort(compareAcademicTerms).reverse();
    return terms;
  }

  static async getSubjectAreasForTerm(term) {
    const subjectAreas = await MediaQuery.getSubjectAreasForTerm(
      'musicreserves',
      term
    );
    return subjectAreas;
  }
}

module.exports = MusicresServices;
