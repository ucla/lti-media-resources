import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@instructure/ui-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo } from '@fortawesome/free-solid-svg-icons';

export const PlayButton = ({ type, selectMediaURL }) => {
  PlayButton.propTypes = {
    type: PropTypes.string,
    selectMediaURL: PropTypes.func,
  };
  let playIcon = null;
  if (type === 'audio') {
    playIcon = <FontAwesomeIcon icon={faMicrophone} />;
  } else if (type === 'video') {
    playIcon = <FontAwesomeIcon icon={faVideo} />;
  }
  return (
    <Button
      renderIcon={playIcon}
      color="primary"
      margin="xxx-small"
      size="medium"
      onClick={selectMediaURL}
    >
      Play
    </Button>
  );
};
