import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { IconVideoSolid, IconMicSolid } from '@instructure/ui-icons';

import { ltikPromise } from '../../services/ltik';

export const PlayButton = ({
  media,
  format,
  selectMedia,
  file,
  course,
  disabled,
}) => {
  PlayButton.propTypes = {
    media: PropTypes.string,
    format: PropTypes.string,
    selectMedia: PropTypes.func,
    file: PropTypes.string,
    course: PropTypes.object,
    disabled: PropTypes.bool,
  };
  const generateAndSelectMedia = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/url?ltik=${ltik}`, {
          params: {
            mediatype: media,
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
    playIcon = IconMicSolid;
  } else if (format === 'video') {
    playIcon = IconVideoSolid;
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
