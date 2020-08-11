import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo } from '@fortawesome/free-solid-svg-icons';

import { ltikPromise } from '../../services/ltik';

export const PlayButton = ({ type, selectMedia, src, course, _id }) => {
  PlayButton.propTypes = {
    type: PropTypes.string,
    selectMedia: PropTypes.func,
    src: PropTypes.string,
    course: PropTypes.object,
    _id: PropTypes.string,
  };
  const generateAndSelectMedia = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/bruincast/url?ltik=${ltik}`, {
          params: {
            type: type.charAt(0),
            src,
            quarter: course.quarter,
          },
        })
        .then(res => {
          selectMedia({
            type,
            url: res.data,
            _id,
          });
        });
    });
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
      onClick={generateAndSelectMedia}
    >
      Play
    </Button>
  );
};
