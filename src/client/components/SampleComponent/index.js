import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { ltikPromise } from '../../services/ltik';

export const SampleComponent = () => {
  const samplePromise = async () => 'ltik';
  const sampleAxiosCall = () => {
    samplePromise().then(ltik => {
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
    });
  };
  React.useEffect(sampleAxiosCall, []);
  return <p>haha</p>;
};
