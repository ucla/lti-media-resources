/**
 * @jest-environment node
 */

// https://github.com/axios/axios/issues/1754
// https://dev.to/zaklaughton/the-only-3-steps-you-need-to-mock-an-api-call-in-jest-39mb
// to run: yarn run test

require('regenerator-runtime/runtime');
const axios = require('axios');
const registrar = require('./registrar');
require('dotenv').config();

jest.mock('axios');

/**
 * @param config
 */
async function axiosMock(config) {
  if (config.url === `${process.env.REGISTRAR_API_URL}bad url`) {
    // 404 response
    throw {
      response: {
        status: 404,
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
}
axios.mockImplementation(axiosMock);
registrar.getToken = jest.fn().mockResolvedValue('good token');

// Call good link, should return correct values
test('1. Normal token retrieval', async () => {
  const response = await registrar.call({ url: 'good url' });
  expect(response).toEqual('good response');
});

// Set token to garbage, call good link, should return correct values
test('2. Bad token handling', async () => {
  process.env.reg_token = 'bad token';
  const response = await registrar.call({ url: 'good url' });
  expect(response).toEqual('good response');
});

// Given a garbage link, should log 404 and return null
test('3. Bad endpoint handling', async () => {
  const response = await registrar.call({ url: 'bad url' });
  expect(response).toEqual(null);
});
