/* eslint-disable react/prop-types */
import React from 'react';
// before mounting your React application:
import theme from '@instructure/canvas-high-contrast-theme';
import './app.css';

import { Heading } from '@instructure/ui-heading';

import { ltikPromise } from '../../services/ltik';

theme.use({ overrides: { colors: { brand: 'red' } } });

const App = () => <Heading>Hello World!</Heading>;

export default App;
