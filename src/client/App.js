/* eslint-disable react/prop-types */
import React from 'react';
// before mounting your React application:
import theme from '@instructure/canvas-high-contrast-theme';
import './app.css';

import { Heading } from '@instructure/ui-heading';

theme.use({ overrides: { colors: { brand: 'red' } } });

const App = () => {
  const getLtikPromise = new Promise((resolve, reject) => {
    const searchParams = new URLSearchParams(window.location.search);
    let potentialLtik = searchParams.get('ltik');
    if (!potentialLtik) {
      potentialLtik = sessionStorage.getItem('ltik');
      if (!potentialLtik) reject(new Error('Missing lti key.'));
    }
    resolve(potentialLtik);
  });

  const setLtikPromise = new Promise((resolve, reject) => {
    getLtikPromise
      .then(res => {
        sessionStorage.setItem('ltik', res);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });

  return <Heading>Hello World!</Heading>;
};

export default App;
