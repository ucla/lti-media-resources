import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo } from '@fortawesome/free-solid-svg-icons';

import { ltikPromise } from '../../services/ltik';

export const PlayButton = ({ type, selectMedia, src, course }) => {
  PlayButton.propTypes = {
    type: PropTypes.string,
    selectMedia: PropTypes.func,
    src: PropTypes.string,
    course: PropTypes.object,
  };
  const generateSetMedia = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/url?ltik=${ltik}`, {
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
      onClick={generateSetMedia}
    >
      Play
    </Button>
  );
};
