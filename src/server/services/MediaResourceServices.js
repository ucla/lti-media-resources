const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');

const MediaQuery = require('../models/mediaquery');
const { compareAcademicTerms } = require('./utility');
const constants = require('../../../constants');

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

  static async updatePlayback(
    userid,
    file,
    mediaType,
    classShortname,
    time,
    remaining,
    finished
  ) {
    const ok = await MediaQuery.updatePlayback(
      { userid, file, mediaType, classShortname, time, remaining, finished },
      'playbacks'
    );
    return ok;
  }

  static async getTerms(mediaType) {
    let mediaCollectionName = '';

    switch (parseInt(mediaType)) {
      case constants.MEDIA_TYPE.BRUINCAST:
        mediaCollectionName = 'bruincastmedia';
        break;
      case constants.MEDIA_TYPE.VIDEO_RESERVES:
        mediaCollectionName = 'videoreserves';
        break;
      case constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES:
        mediaCollectionName = 'musicreserves';
        break;
      default:
        throw new Error('Invalid mediaType');
    }

    const terms = await MediaQuery.getTerms(mediaCollectionName);
    terms.sort(compareAcademicTerms).reverse();
    return terms;
  }

  static async getSubjectAreasForTerm(mediaType, term) {
    let mediaCollectionName = '';
    switch (parseInt(mediaType)) {
      case constants.MEDIA_TYPE.BRUINCAST:
        mediaCollectionName = 'bruincastmedia';
        break;
      case constants.MEDIA_TYPE.VIDEO_RESERVES:
        mediaCollectionName = 'videoreserves';
        break;
      case constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES:
        mediaCollectionName = 'musicreserves';
        break;
      default:
        throw new Error('Invalid mediaType');
    }

    const subjectAreas = await MediaQuery.getSubjectAreasForTerm(
      mediaCollectionName,
      term
    );
    return subjectAreas;
  }

  static async generateMediaToken(stream, clientIP, secret, start, end) {
    const { TOKEN_NAME } = process.env;
    const params = [
      `${TOKEN_NAME}starttime=${start}`,
      `${TOKEN_NAME}endtime=${end}`,
      secret,
    ];
    if (clientIP) {
      params.push(clientIP);
    }
    params.sort();

    let string4Hashing = `${stream}?`;
    for (const entry of params) {
      string4Hashing += `${entry}&`;
    }
    string4Hashing = string4Hashing.substr(0, string4Hashing.length - 1);
    const hash = sha256(string4Hashing);
    const base64Hash = Base64.stringify(hash)
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return base64Hash;
  }

  static async generateMediaURL(
    mediatype,
    HOST,
    stream,
    clientIP,
    secret,
    start,
    end
  ) {
    const { TOKEN_NAME } = process.env;
    const base64Hash = await this.generateMediaToken(
      stream,
      clientIP,
      secret,
      start,
      end
    );
    if (parseInt(mediatype) === constants.MEDIA_TYPE.BRUINCAST) {
      const newStream = `redirect/${stream}`;
      const bcastPlaybackURL = `${HOST}${newStream}?type=m3u8&${TOKEN_NAME}starttime=${start}&${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
      return bcastPlaybackURL;
    }
    const playbackURL = `${HOST}${stream}?${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
    return playbackURL;
  }
}

module.exports = MediaResourceServices;
