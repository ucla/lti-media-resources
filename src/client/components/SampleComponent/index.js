import React from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import PropTypes from 'prop-types';

import { ltikPromise } from '../../services/ltik';

axiosRetry(axios);

export const SampleComponent = () => {
  const sampleAxiosCall = () => {
    axios
      .get('https://www.google.com/search', {
        params: {
          q: 'axios',
        },
      })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };
  React.useEffect(sampleAxiosCall, []);
  return <p>haha</p>;
};
