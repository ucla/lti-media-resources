const axios = require('axios');
const https = require('https');
const fs = require('fs');
const registrarDebug = require('debug')('registrar:api');
require('dotenv').config();

let registrar = {};

/**
 * Retrieves token from web service.
 *
 * @returns {string}
 */
async function getToken() {
  registrarDebug('getToken called');
  const data = 'grant_type=client_credentials';
  const certFile = process.env.REG_WS_CERT_NAME;
  const keyFile = process.env.REG_WS_PRIVATE_KEY;

  const httpsAgent = new https.Agent({
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile),
  });

  const tokenConfig = {
    method: 'post',
    url: `${process.env.REG_WS_API_URL}:4443/oauth2/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    auth: {
      username: process.env.REG_WS_CLIENT_ID,
      password: process.env.REG_WS_SECRET,
    },
    data,
    httpsAgent,
  };

  try {
    const response = await axios(tokenConfig, httpsAgent);
    const { access_token: token } = response.data;
    registrarDebug(`getToken returning ${token}`);
    return token;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Stores token in environment variable.
 *
 * @param {string} token Token to cache.
 */
async function cacheToken(token) {
  registrarDebug('cacheToken called');
  try {
    process.env.reg_token = token;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Called when token is invalid. Gets new token and stores it.
 *
 * @returns {string}    Returns cached token.
 */
async function refreshToken() {
  registrarDebug('refreshToken called');
  try {
    const token = await registrar.getToken();
    await registrar.cacheToken(token);
    return token;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Makes call to Registrar web service endpoint.
 *
 * @param {object} params   Should have relative path url set. Passed to axios.
 * @returns {?string}       JSON with data from web service.
 * @throws Exception if server returns 400 or 500 error.
 */
async function call(params) {
  registrarDebug(`call called with ${JSON.stringify(params)}`);
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

    params.baseURL = process.env.REG_WS_API_URL;

    const response = await axios(params);
    registrarDebug(`call returning with ${response.data}`);
    return response.data;
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 403) {
      // Token may have expired
      registrarDebug('call: Token may have expired, retrying');
      params.headers.esmAuthnClientToken = await registrar.refreshToken();
      const retryResponse = await axios(params);
      if (retryResponse.status === 200) {
        registrarDebug(`call returning with ${retryResponse.data}`);
        return retryResponse.data;
      }
    } else if (error.response.status === 404) {
      registrarDebug('call returning null (404 response)');
      return null;
    }
    registrarDebug(`call throwing error ${error}`);
    const errorObject = new Error(error.message);
    errorObject.code = error.response.status;
    throw errorObject;
  }
}

/**
 * Converts a given offeredTermCode and classSectionID to the following
 * shortname format:
 *
 *  Strip spaces/ampersands from subject areas.
 *      <3 char term>-<subject area><display course number>-<display section number>
 *
 * @param {string} offeredTermCode  Term.
 * @param {string} classSectionID   ClassID aka SRS.
 * @returns {?string}   Returns shortname if CourseClassIdentifiers were found.
 */
async function getShortname(offeredTermCode, classSectionID) {
  try {
    const response = await registrar.call({
      url: `/sis/api/v1/Dictionary/${offeredTermCode}/${classSectionID}/CourseClassIdentifiers`,
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
    const shortname = `${offeredTermCode}-${subArea.replace(
      /\s|&/g,
      ''
    )}${catNum.replace(/\s|^0+/g, '')}-${secNum.replace(/^0+/g, '')}`;
    return shortname;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Gets the week number, given an academic term and a date
 *
 * @param {string} term Academic term, formatted as YYQ (e.g. 20S)
 * @param {string} date Date string formatted as MM/DD/YYYY
 * @returns {?string} Returns week number if date is valid in term
 */
async function getWeekNumber(term, date) {
  try {
    const response = await registrar.call({
      url: `sis/api/v1/Dictionary/TermSessionsByWeek?SessionTermCode=${term}&SessionCode=RG&PageSize=12`,
    });
    if (response === null) return null;
    const {
      termSessionsByWeek: [{ termSessionCollection: weeksArray }],
    } = response;

    // Splits the date parameter into an array: [0] MM, [1] DD, [2] YYYY
    const dateElements = date.split('/');
    const dateToCheck = new Date(
      dateElements[2], // Year
      dateElements[0] - 1, // Month - 1, because the month is 0-indexed
      dateElements[1] // Date
    );

    for (const week of weeksArray) {
      // The sessionWeekStartDate and sessionWeekEndDate are formatted as YYYY-MM-DD
      // Split start and end dates into elements array: [0] YYYY, [1] MM, [2] DD
      const startDateElements = week.sessionWeekStartDate.split('-');
      const lastDateElements = week.sessionWeekLastDate.split('-');
      const startDate = new Date(
        startDateElements[0],
        startDateElements[1] - 1,
        startDateElements[2]
      );
      const lastDate = new Date(
        lastDateElements[0],
        lastDateElements[1] - 1,
        lastDateElements[2]
      );

      if (startDate <= dateToCheck && dateToCheck <= lastDate) {
        return week.sessionWeekNumber;
      }
    }
    return '';
  } catch (error) {
    console.error(error);
    return null;
  }
}

registrar = {
  getShortname,
  getWeekNumber,
  call,
  getToken,
  cacheToken,
  refreshToken,
};

module.exports = registrar;
