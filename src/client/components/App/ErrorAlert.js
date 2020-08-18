import React from 'react';
import PropTypes from 'prop-types';

import { Alert } from '@instructure/ui-alerts';

export const ErrorAlert = ({ err, msg }) => {
  ErrorAlert.propTypes = {
    err: PropTypes.object,
    msg: PropTypes.string,
  };
  return (
    <Alert variant="error" renderCloseButtonLabel="Close">
      {`${msg}\n${err}`}
    </Alert>
  );
};
