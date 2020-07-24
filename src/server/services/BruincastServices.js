const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const MediaQuery = require('../models/mediaquery');

const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

class BruincastServices {
  static async getNotice() {
    const notice = await MediaQuery.getNotice();
    return dompurify.sanitize(notice);
  }

  static async setNotice(notice) {
    const ret = await MediaQuery.setNotice(notice);
    return ret;
  }

  static async getCasts(courseLabel) {
    const docs = await MediaQuery.getCastsByCourse(courseLabel);
    for (const doc of docs) {
      doc.date = new Date(doc.date);
      doc.videos = [doc.video];
      doc.audios = [doc.audio];
      doc.comments = dompurify.sanitize(doc.comments);
    }
    docs.sort((a, b) => a.date - b.date);
    return docs;
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

  static async generateMediaURL(HOST, stream, clientIP, secret, start, end) {
    const { TOKEN_NAME } = process.env;
    const HOST_URL = `https://${HOST}:443/`;
    const base64Hash = await this.generateMediaToken(
      stream,
      clientIP,
      secret,
      start,
      end
    );
    const newStream = `redirect/${stream}`;
    const playbackURL = `${HOST_URL}${newStream}?type=m3u8&${TOKEN_NAME}starttime=${start}&${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
    return playbackURL;
  }
}

module.exports = BruincastServices;
