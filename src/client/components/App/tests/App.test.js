import React from 'react';
import axios from 'axios';
import { render, cleanup, waitForElement } from '@testing-library/react';
import App from '../index';

jest.mock('axios');
jest.mock('../../../services/ltik');

afterEach(cleanup);

test('axios error handling in App', async done => {
  axios.get.mockImplementation(() =>
    Promise.reject(
      new Error({
        response: {
          status: 400,
        },
      })
    )
  );
  const { getByTestId, asFragment } = render(<App />);

  expect(axios.get).toBeCalled();
  const alertNode = await waitForElement(() => getByTestId('alert'));
  expect(alertNode).toBeDefined();
  expect(asFragment()).toMatchSnapshot();
  done();
});
