const axios = require('axios');
const registrarDebug = require('debug')('registrar:api');
const cache = require('./cache');

require('dotenv').config();

let registrar = {};

/**
 * Retrieves token from web service.
 *
 * @returns {string} Token
 */
async function getToken() {
  registrarDebug('getToken called');

  const authToken = Buffer.from(
    `${process.env.SECRET_REG_WS_CLIENT_ID}:${process.env.SECRET_REG_WS_PASSWORD}`
  ).toString('base64');

  const tokenConfig = {
    method: 'post',
    url: `${process.env.REG_WS_API_URL}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
    headers: {
      Authorization: `Basic ${authToken}`,
    },
  };

  try {
    const response = await axios(tokenConfig);
    const { access_token: token } = response.data;
    registrarDebug(`getToken returning ${token}`);
    return token;
  } catch (error) {
    registrarDebug(`getToken error: ${error.message}`);
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
    registrarDebug(`cacheToken error: ${error.message}`);
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
    registrarDebug(`refreshToken error: ${error.message}`);
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
      params.headers = { Authorization: `Bearer ${token}` };
    } else {
      params.headers.Authorization = `Bearer ${token}`;
    }

    params.baseURL = process.env.REG_WS_API_URL;

    const response = await axios(params);
    registrarDebug(`call returning with ${response.data}`);
    return response.data;
  } catch (error) {
    if (error.response.status === 401 || error.response.status === 403) {
      // Token may have expired
      registrarDebug('call: Token may have expired, retrying');
      params.headers.Authorization = await registrar.refreshToken();
      const retryResponse = await axios(params);
      if (retryResponse.status === 200) {
        registrarDebug(`call returning with ${retryResponse.data}`);
        return retryResponse.data;
      }
    } else if (error.response.status === 429 || error.response.status === 500) {
      registrarDebug(
        error.response.status === 429
          ? 'call: Rate limit reached, retrying'
          : 'call: Server error, retrying'
      );
      const retryResponse = await axios(params);
      if (retryResponse.status === 200) {
        registrarDebug(`call returning with ${retryResponse.data}`);
        return retryResponse.data;
      }
    } else if (error.response.status === 404) {
      registrarDebug('call returning null (404 response)');
      return null;
    }
    registrarDebug(`call error: ${error.message}`);
    const errorObject = new Error(error.message);
    errorObject.code = error.response.status;
    throw errorObject;
  }
}

/**
 * Converts a given offeredTermCode and classSectionID to the following
 * shortname format:
 *
 *  term-subj_area-crsidx- secidx
 *
 * @param {string} offeredTermCode  Term.
 * @param {string} classSectionID   ClassID aka SRS.
 * @returns {?object}   Returns object with shortname and subjectArea if CourseClassIdentifiers were found.
 */
async function getShortname(offeredTermCode, classSectionID) {
  registrarDebug(
    `getShortname: called with ${offeredTermCode}|${classSectionID}`
  );

  const returnObject = {
    shortname: null,
    subjectArea: null,
  };

  let term = offeredTermCode;
  try {
    let response = await registrar.call({
      url: `/sis/dictionary/${offeredTermCode}/${classSectionID}/courseclassidentifiers/v1`,
    });
    if (response === null) {
      registrarDebug('getShortname: CourseClassIdentifiers is null');
      return returnObject;
    }
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

    // Check if course is summer sessions.
    // CANVAS-184 - Commented out to handle summer course to match up with Canvas SIS-ID.
//    if (offeredTermCode.slice(-1) === '1') {
//      registrarDebug('getShortname: Handling Summer session');
//      // Get session group.
//      response = await registrar.call({
//        url: `/sis/classes/${offeredTermCode}/v1`,
//        params: {
//          subjectAreaCode: subArea,
//          courseCatalogNumber: catNum,
//          classNumber: secNum,
//        },
//      });
//
//      if (response === null) {
//        registrarDebug('getShortname: Classes is null');
//        return returnObject;
//      }
//
//      // Find the session that matches the class number.
//      let sessionGroup = '';
//      response.classes[0].termSessionGroupCollection.forEach((groupItem) => {
//        groupItem.classCollection.forEach((classItem) => {
//          if (classItem.classNumber === secNum) {
//            sessionGroup = groupItem.termsessionGroupCode;
//          }
//        });
//      });
//
//      registrarDebug(`getShortname: using sessionGroup ${sessionGroup}`);
//      term += sessionGroup;
//    }

    // Combine shortname components.
    const shortname = `${term}-${subArea}-${catNum}-${secNum}`;

    registrarDebug(`getShortname: returning { ${shortname}, ${subArea}`);
    returnObject.shortname = shortname;
    returnObject.subjectArea = subArea;
    return returnObject;
  } catch (error) {
    registrarDebug(`getShortname error: ${error.message}`);
    return returnObject;
  }
}

/**
 * Gets the week number, given an academic term and a date
 *
 * @param {string} term Academic term, formatted as YYQ (e.g. 20S) or summer session YY1A/YY1C (e.g. 201A/201C)
 * @param {string} date Date string formatted as MM/DD/YYYY
 * @returns {?number} Returns week number if date is valid in term
 */
async function getWeekNumber(term, date) {
  registrarDebug(`getWeekNumber: called with ${term} | ${date}`);
  try {
    let response = cache.get(`TermSessionsByWeek_${term}`);
    if (response === undefined) {
      // If TermSessionsByWeek for term isn't cached, fetch it
      registrarDebug(
        `getWeekNumber: TermSessionsByWeek_${term} not found in cache. Fetching from API`
      );

      // API parameters
      let termParam = term;
      let sessionCodeParam = 'RG';

      // Handle summer session term
      registrarDebug(`getWeekNumber: Handling summer session term`);
      if (term.length === 4) {
        termParam = term.slice(0, 3);

        // Session A
        if (term.charAt(3) === 'A') {
          sessionCodeParam = '1A';
        }

        // Session C
        if (term.charAt(3) === 'C') {
          sessionCodeParam = '6C';
        }
      }

      response = await registrar.call({
        url: `/sis/dictionary/termsessionsbyweek/v1`,
        params: {
          SessionTermCode: termParam,
          SessionCode: sessionCodeParam,
          PageSize: 12,
        },
      });
      if (response === null) {
        registrarDebug(
          `getWeekNumber: TermSessionsByWeek API response is null`
        );
        return null;
      }

      cache.set(`TermSessionsByWeek_${term}`, response);
    }

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
      // The sessionWeekStartDate and sessionWeekLastDate are formatted as YYYY-MM-DD
      // Split start and end dates into elements array: [0] YYYY, [1] MM, [2] DD
      let startDate = cache.get(`Date_${week.sessionWeekStartDate}`);
      if (startDate === undefined) {
        const startDateElements = week.sessionWeekStartDate.split('-');
        startDate = new Date(
          startDateElements[0],
          startDateElements[1] - 1,
          startDateElements[2]
        );
        cache.set(`Date_${week.sessionWeekStartDate}`, startDate);
      }

      let lastDate = cache.get(`Date_${week.sessionWeekLastDate}`);
      if (lastDate === undefined) {
        const lastDateElements = week.sessionWeekLastDate.split('-');
        lastDate = new Date(
          lastDateElements[0],
          lastDateElements[1] - 1,
          lastDateElements[2]
        );
        cache.set(`Date_${week.sessionWeekLastDate}`, lastDate);
      }

      if (startDate <= dateToCheck && dateToCheck <= lastDate) {
        registrarDebug(`getWeekNumber: returning ${week.sessionWeekNumber}`);
        return parseInt(week.sessionWeekNumber);
      }
    }

    registrarDebug(`getWeekNumber: returning null`);
    return null;
  } catch (error) {
    registrarDebug(`getWeekNumber error: ${error.message}`);
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
