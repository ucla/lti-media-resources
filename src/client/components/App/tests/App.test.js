import React from 'react';
import axios from 'axios';
import { cleanup, render, waitFor } from '@testing-library/react';
import { shallow } from 'enzyme';
import App from '../index';

jest.mock('axios');
jest.mock('../../../services/ltik');

beforeEach(() => {
  document.documentElement.setAttribute('dir', 'ltr');
});
afterEach(cleanup);

test('Axios error handling in App', async (done) => {
  axios.get.mockImplementation(() =>
    Promise.reject(
      new Error({
        response: {
          status: 400,
        },
      })
    )
  );
  const { getByTestId } = render(<App />);
  const alertNode = await waitFor(() => getByTestId('alert'));
  expect(axios.get).toBeCalled();
  expect(alertNode).toBeDefined();
  done();
});

test('App component matches its original snapshot', (done) => {
  const appInstance = shallow(<App />);
  expect(appInstance).toMatchSnapshot();
  done();
});
