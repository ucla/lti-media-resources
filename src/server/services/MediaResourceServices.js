const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');

const MediaQuery = require('../models/mediaquery');
const { compareAcademicTerms } = require('./utility');
const {
  MEDIA_TYPE,
  COLLECTION_TYPE,
  collectionMap,
} = require('../../../constants');

class MediaResourceServices {
  /**
   * Count how many of each media type the course has
   *
   * @param {string} courseLabel  Course counting for.
   * @returns {object}   Return the count for each media type.
   */
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

    const musicresCount = await MediaQuery.getMusicResCountByCourse(
      courseLabel
    );

    return {
      bruincasts: bruincastCount,
      videos: videoresCount,
      audios: musicresCount,
    };
  }

  /**
   * Check if the user is a student, instructor, or admin
   *
   * @param {number} userid  User of the playback.
   * @param {string} file  Media of the playback.
   * @param {number} mediaType  Number that indicate bruincast, video reserves, or music reserves.
   * @param {string} classShortname  Label of course of the media.
   * @param {number} time  Watched time, or in other words, user's progress of the media.
   * @param {number} remaining  Remaining time of the media.
   * @param {boolean} finished  If the user finished the media or not.
   * @returns {number}   Return database operation status (success or failure).
   */
  static async updatePlayback(
    userid,
    file,
    mediaType,
    classShortname,
    time,
    remaining,
    finished
  ) {
    const ok = await MediaQuery.updatePlayback({
      userid,
      file,
      mediaType,
      classShortname,
      time,
      remaining,
      finished,
    });
    return ok;
  }

  /**
   * Retrieve all terms that the database has for a media type
   *
   * @param {number} mediaType  Media type to query for
   * @returns {Array}   Return all terms (ex. 20S).
   */
  static async getTerms(mediaType) {
    let mediaCollectionName = '';

    switch (parseInt(mediaType)) {
      case MEDIA_TYPE.BRUINCAST:
        mediaCollectionName = collectionMap.get(COLLECTION_TYPE.BRUINCAST);
        break;
      case MEDIA_TYPE.VIDEO_RESERVES:
        mediaCollectionName = collectionMap.get(COLLECTION_TYPE.VIDEO_RESERVES);
        break;
      case MEDIA_TYPE.DIGITAL_AUDIO_RESERVES:
        mediaCollectionName = collectionMap.get(
          COLLECTION_TYPE.DIGITAL_AUDIO_RESERVES
        );
        break;
      default:
        throw new Error('Invalid mediaType');
    }

    const terms = await MediaQuery.getTerms(mediaCollectionName);
    terms.sort(compareAcademicTerms).reverse();
    return terms;
  }

  /**
   * Retrieve all subject areas that the database has for a media type and a term
   *
   * @param {number} mediaType  Media type to query for.
   * @param {string} term  Term to query for.
   * @returns {Array}   Return all subject areas, abbreviated.
   */
  static async getSubjectAreasForTerm(mediaType, term) {
    let mediaCollectionName = '';
    switch (parseInt(mediaType)) {
      case MEDIA_TYPE.BRUINCAST:
        mediaCollectionName = collectionMap.get(COLLECTION_TYPE.BRUINCAST);
        break;
      case MEDIA_TYPE.VIDEO_RESERVES:
        mediaCollectionName = collectionMap.get(COLLECTION_TYPE.VIDEO_RESERVES);
        break;
      case MEDIA_TYPE.DIGITAL_AUDIO_RESERVES:
        mediaCollectionName = collectionMap.get(
          COLLECTION_TYPE.DIGITAL_AUDIO_RESERVES
        );
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

  /**
   * Generate hashed token for media URL
   *
   * @param {string} stream  A URL path that indicate which file to play from server.
   * @param {string} clientIP  Client's IP.
   * @param {string} secret  A very secret secret.
   * @param {number} start  Start time when the token is valid
   * @param {number} end  End time when the token will not be valid anymore
   * @returns {string}   Return hashed token.
   */
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

  /**
   * Generate URL for media
   *
   * @param {number} mediatype  Media type of the media
   * @param {string} HOST  Server url.
   * @param {string} stream  A url path that indicate which file to play from server.
   * @param {string} clientIP  Client's IP.
   * @param {string} secret  A very secret secret.
   * @param {number} start  Start time when the token is valid
   * @param {number} end  End time when the token will not be valid anymore
   * @returns {string}   Return generated URL.
   */
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
    if (parseInt(mediatype) === MEDIA_TYPE.BRUINCAST) {
      const newStream = `redirect/${stream}`;
      const bcastPlaybackURL = `${HOST}${newStream}?type=m3u8&${TOKEN_NAME}starttime=${start}&${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
      return bcastPlaybackURL;
    }
    const playbackURL = `${HOST}${stream}?${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
    return playbackURL;
  }
}

module.exports = MediaResourceServices;
