/* eslint-disable no-throw-literal */

import React from 'react';
import axios from 'axios';
import { mount } from 'enzyme';
// Import axiosRetry from 'axios-retry';
import { Bruincast } from '../index';

jest.mock('axios');
// Jest.mock('axios-retry');
jest.mock('../../../services/ltik');

test('axios error handling in App', done => {
  // Const retrySpy = jest.spyOn(axiosRetryMod, 'axiosRetry');
  axios.get.mockImplementationOnce(() => {
    console.log('???????????????????????????????????????');
    return Promise.reject(
      new Error({
        response: {
          status: 400,
        },
      })
    );
  });
  // AxiosRetry.mockImplementationOnce(a => a);
  const sampleCourse = { label: '20S-LOL-1', quarter: '20S', title: 'LOL' };
  const sampleWarning = '<p></p>';
  const sampleRetrieveWarning = jest.fn();
  const sampleUserid = 1;
  const sampleSetError = jest.fn(obj => obj);
  const bcastInstance = mount(
    <Bruincast
      course={sampleCourse}
      warning={sampleWarning}
      retrieveWarning={sampleRetrieveWarning}
      userid={sampleUserid}
      setError={sampleSetError}
    />
  );
  expect(axios.get).toBeCalled();
  done();
});
