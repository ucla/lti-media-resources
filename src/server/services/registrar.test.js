// https://github.com/axios/axios/issues/1754
// https://dev.to/zaklaughton/the-only-3-steps-you-need-to-mock-an-api-call-in-jest-39mb
// To run: yarn run test

import { mockImplementation } from 'axios';
import registrar from './registrar';

require('dotenv').config();

jest.mock('axios');

/**
 * Mocks getToken call.
 *
 * @param {object} config   Parameters being passed to axios.
 * @returns {string}        On valid response, returns good token
 * @throws Exception for HTTP error codes.
 */
async function axiosMock(config) {
  /* eslint-disable no-throw-literal */
  if (config.url === '/badurl') {
    // 400 response
    throw {
      response: {
        status: 400,
      },
    };
  } else if (config.url === '/emptyurl') {
    // 404 response
    throw {
      response: {
        status: 404,
        data: null,
      },
    };
  } else if (process.env.reg_token === 'bad token') {
    // 401 response
    throw {
      response: {
        status: 401,
      },
    };
  } else {
    // OK response
    return {
      status: 200,
      data: 'good response',
    };
  }
  /* eslint-enable no-throw-literal */
}
mockImplementation(axiosMock);
registrar.getToken = jest.fn().mockResolvedValue('good token');

// Call good link, should return correct values
test('Normal token retrieval', async () => {
  const response = await registrar.call({ url: '/goodurl' });
  expect(response).toEqual('good response');
});

// Set token to garbage, call good link, should return correct values
test('Bad token handling', async () => {
  process.env.reg_token = 'bad token';
  const response = await registrar.call({ url: '/goodurl' });
  expect(response).toEqual('good response');
});

// Given a garbage link, should log 400 and return exception
test('Bad endpoint handling', async () => {
  await expect(registrar.call({ url: '/badurl' })).rejects.toThrow();
});

// Given a empty records it should return null
test('Empty results handling', async () => {
  const response = await registrar.call({ url: '/emptyurl' });
  expect(response).toEqual(null);
});
