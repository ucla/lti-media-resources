import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo } from '@fortawesome/free-solid-svg-icons';

import { ltikPromise } from '../../services/ltik';

export const PlayButton = ({
  format,
  selectMedia,
  file,
  course,
  tab,
  disabled,
}) => {
  PlayButton.propTypes = {
    format: PropTypes.string,
    selectMedia: PropTypes.func,
    file: PropTypes.string,
    course: PropTypes.object,
    tab: PropTypes.number,
    disabled: PropTypes.bool,
  };
  const generateAndSelectMedia = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/url?ltik=${ltik}`, {
          params: {
            mediatype: tab,
            mediaformat: format.charAt(0),
            filename: file,
            quarter: course.quarter,
          },
        })
        .then(res => {
          selectMedia({
            format,
            url: res.data,
          });
        });
    });
  };
  let playIcon = null;
  if (format === 'audio') {
    playIcon = <FontAwesomeIcon icon={faMicrophone} />;
  } else if (format === 'video') {
    playIcon = <FontAwesomeIcon icon={faVideo} />;
  }
  return (
    <Button
      renderIcon={playIcon}
      color="primary"
      margin="xxx-small"
      size="medium"
      onClick={generateAndSelectMedia}
      interaction={disabled ? 'disabled' : 'enabled'}
    >
      {disabled ? 'Unavailable' : 'Play'}
    </Button>
  );
};
