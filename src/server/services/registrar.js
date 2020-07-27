const axios = require('axios');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const data = 'grant_type=client_credentials';
const certFile = process.env.CERT_NAME;
const keyFile = process.env.PRIVATE_KEY;

const httpsAgent = new https.Agent({
  cert: fs.readFileSync(certFile),
  key: fs.readFileSync(keyFile),
});

const tokenConfig = {
  method: 'post',
  url: `${process.env.REGISTRAR_API_URL}:4443/oauth2/token`,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  auth: {
    username: process.env.CLIENT_ID,
    password: process.env.SECRET,
  },
  data,
  httpsAgent,
};

/**
 *
 */
async function getToken() {
  try {
    const response = await axios(tokenConfig, httpsAgent);
    const { access_token: token } = response.data;
    return token;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param token
 */
async function cacheToken(token) {
  try {
    process.env.reg_token = token;
  } catch (error) {
    console.log(error);
  }
}
/**
 *
 */
async function refreshToken() {
  try {
    const token = await registrar.getToken();
    await registrar.cacheToken(token);
    return token;
  } catch (error) {
    console.log(error);
  }
}
/**
 * @param params
 */
async function call(params) {
  try {
    const token =
      process.env.reg_token === undefined
        ? await registrar.refreshToken()
        : process.env.reg_token;

    if (params.headers === undefined) {
      params.headers = { esmAuthnClientToken: token };
    } else {
      params.headers.esmAuthnClientToken = token;
    }

    params.url = process.env.REGISTRAR_API_URL + params.url;

    const response = await axios(params);
    return response.data;
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 403) {
      // Token may have expired
      params.headers.esmAuthnClientToken = await registrar.refreshToken();
      const retryResponse = await axios(params);

      if (retryResponse.status === 200) {
        return retryResponse.data;
      }
    }
    return null;
  }
}

/**
 * @param term
 * @param srs
 */
async function getShortname(term, srs) {
  try {
    const response = await registrar.call({
      url: `/sis/api/v1/Dictionary/${term}/${srs}/CourseClassIdentifiers`,
    });
    if (response === null) return null;
    const {
      courseClassIdentifiers: [
        {
          courseClassIdentifierCollection: [
            {
              subjectAreaCode: subArea,
              courseCatalogNumber: catNum,
              classSectionNumber: secNum,
            },
          ],
        },
      ],
    } = response;
    const shortname = `${'201'}-${subArea.replace(/\s|&/g, '')}${catNum.replace(
      /\s|^0+/g,
      ''
    )}-${secNum.replace(/^0+/g, '')}`;
    return shortname;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const registrar = {
  getShortname,
  call,
  getToken,
  cacheToken,
  refreshToken,
};

module.exports = registrar;
