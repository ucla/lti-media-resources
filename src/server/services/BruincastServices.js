const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

class BruincastServices {
  static async getNotice() {
    const result = '<p>A default notice</p>';
    return dompurify.sanitize(result);
  }

  static async getCasts(courseLabel) {
    const result = [
      {
        id: 0,
        title: 'Sample',
        comments: ['Sample'],
        date: new Date(2020, 2, 14),
        audios: [''],
        videos: ['eeb162-1-20200331-18431.mp4'],
      },
      {
        id: 1,
        title: 'Content is from CS 32 (Winter 2012)',
        comments: ['Date of lecture: 3/7/2012'],
        date: new Date(2020, 2, 7),
        audios: [''],
        videos: ['cs32-1-20200506-18379.mp4'],
      },
      {
        id: 2,
        title: 'Content is from CS 32 (Winter 2012)',
        comments: ['Date of lecture: 3/5/2012'],
        date: new Date(2020, 2, 5),
        audios: [],
        videos: ['cs32-1-20200504-18378.mp4'],
      },
    ];
    result.sort((a, b) => a.date - b.date);
    return result;
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
