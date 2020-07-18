const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');

const generateMediaToken = (stream, clientIP, secret, start, end) => {
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
};

const generateMediaURL = (HOST, stream, clientIP, secret, start, end) => {
  const { TOKEN_NAME } = process.env;
  const HOST_URL = `https://${HOST}:443/`;
  const base64Hash = generateMediaToken(stream, clientIP, secret, start, end);
  const newStream = `redirect/${stream}`;
  const playbackURL = `${HOST_URL}${newStream}?type=m3u8&${TOKEN_NAME}starttime=${start}&${TOKEN_NAME}endtime=${end}&${TOKEN_NAME}hash=${base64Hash}`;
  return playbackURL;
};

module.exports.generateMediaURL = generateMediaURL;
module.exports.generateMediaToken = generateMediaToken;
