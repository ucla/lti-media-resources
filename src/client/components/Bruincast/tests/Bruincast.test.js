/* eslint-disable no-throw-literal */

import React from 'react';
import axios from 'axios';
import { render, waitForElement } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
// Import axiosRetry from 'axios-retry';
import { Bruincast } from '../index';

jest.mock('axios');
// Jest.mock('axios-retry');
// const axiosRetryMod = { axiosRetry };

/**
 * Function that mock axios
 */
// async function axiosMock() {
//   throw {
//     response: {
//       status: 400,
//     },
//   };
// }

test('axios error handling in App', done => {
  // Const retrySpy = jest.spyOn(axiosRetryMod, 'axiosRetry');
  axios.get.mockImplementationOnce(() =>
    Promise.reject(
      new Error({
        response: {
          status: 400,
        },
      })
    )
  );
  const sampleCourse = { label: '20S-LOL-1', quarter: '20S', title: 'LOL' };
  const sampleWarning = '<p></p>';
  const sampleRetrieveWarning = jest.fn();
  const sampleUserid = 1;
  const sampleSetError = jest.fn(obj => obj);
  const bcastInstance = render(
    <Bruincast
      course={sampleCourse}
      warning={sampleWarning}
      retrieveWarning={sampleRetrieveWarning}
      userid={sampleUserid}
      setError={sampleSetError}
    />
  );
  // Expect(bcastInstance).toMatchSnapshot();
  expect(axios.get).toBeCalled();
  done();
});
