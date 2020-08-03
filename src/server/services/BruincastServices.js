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

  static async getAllCrosslists() {
    return [
      ['131A-ART133-1', '20S-MATH33B-1'],
      ['a', 'b', 'c'],
    ];
  }

  static async getCasts(course) {
    // First, get all crosslists
    const courseList = [
      course,
      {
        id: 69420,
        label: '201-COMSCI32-1',
        quarter: '201',
        title: 'Introduction to Computer Science II',
      },
    ];

    const castsByCourses = [];
    for (const c of courseList) {
      const docs = await MediaQuery.getCastsByCourse(c.label);
      for (const doc of docs) {
        doc.date = new Date(doc.date);
        doc.videos = [doc.video];
        doc.audios = [doc.audio];
        doc.comments = dompurify.sanitize(doc.comments);
      }
      docs.sort((a, b) => a.date - b.date);
      castsByCourses.push({
        course: c,
        casts: docs,
      });
    }
    return castsByCourses;
  }

  static formatCastListings(castEntries) {
    const formattedArray = [];
    let currentShortname = '';
    let currentListings = [];
    for (const [i, entry] of castEntries.entries()) {
      const entryClassShortname = entry.classShortname;

      let filetype = 'Audio/Video';
      let file = '';
      if (entry.video === '' && entry.audio === '') {
        filetype = 'None';
      } else if (entry.video === '') {
        filetype = 'Audio';
        file = entry.audio;
      } else if (entry.audio === '') {
        filetype = 'Video';
        file = entry.video;
      } else {
        file = `${entry.audio}, ${entry.video}`;
      }

      const formattedEntry = {
        term: entry.term,
        classID: entry.classID,
        date: entry.date,
        title: entry.title,
        comments: dompurify.sanitize(entry.comments),
        type: filetype,
        filename: file,
      };

      if (i === 0) {
        currentShortname = entryClassShortname;
      }

      if (entryClassShortname !== currentShortname) {
        formattedArray.push({
          courseShortname: currentShortname,
          courseListings: currentListings,
        });
        currentListings = [];
        currentShortname = entryClassShortname;
      }

      currentListings.push(formattedEntry);

      if (i === castEntries.length - 1) {
        formattedArray.push({
          courseShortname: currentShortname,
          courseListings: currentListings,
        });
      }
    }

    return formattedArray;
  }

  static async getCastListings(term) {
    const media = await MediaQuery.getCastsByTerm('bruincastmedia', term);
    const formattedArray = this.formatCastListings(media);
    return formattedArray;
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
