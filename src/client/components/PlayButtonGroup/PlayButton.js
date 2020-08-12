import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faVideo,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';

import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

export const PlayButton = ({
  type,
  selectMedia,
  src,
  course,
  file,
  tab,
  eventMediaTitle,
  playback,
}) => {
  PlayButton.propTypes = {
    type: PropTypes.string,
    selectMedia: PropTypes.func,
    src: PropTypes.string,
    course: PropTypes.object,
    file: PropTypes.string,
    tab: PropTypes.number,
    eventMediaTitle: PropTypes.object,
    playback: PropTypes.number,
  };
  const generateAndSelectMedia = () => {
    if (
      tab === constants.TAB_BRUINCAST ||
      tab === constants.TAB_VIDEO_RESERVES
    ) {
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
            const mediaToBeSelected = {
              type,
              url: res.data,
              classShortname: course.label,
              file,
              _id: res.data,
            };
            if (playback !== undefined && playback !== null) {
              mediaToBeSelected.playback = playback;
            }
            selectMedia(mediaToBeSelected);
          });
      });
    } else {
      if (playback !== undefined && playback !== null) {
        eventMediaTitle.playback = playback;
      }
      selectMedia(eventMediaTitle);
    }
  };
  let playIcon = null;
  if (playback) {
    playIcon = <FontAwesomeIcon icon={faPlay} />;
  } else if (type === 'audio') {
    playIcon = <FontAwesomeIcon icon={faMicrophone} />;
  } else if (type === 'video') {
    playIcon = <FontAwesomeIcon icon={faVideo} />;
  }
  let playText = 'Play';
  if (playback) {
    const timeInt = Math.floor(playback);
    const totalMinutes = Math.floor(timeInt / 60);
    const hour = Math.floor(totalMinutes / 60);
    let min = totalMinutes - hour * 60;
    let sec = timeInt % 60;
    if (min < 10) {
      min = `0${min}`;
    }
    if (sec < 10) {
      sec = `0${sec}`;
    }
    if (hour === 0) {
      playText = `${min}:${sec}`;
    } else {
      playText = `${hour}:${min}:${sec}`;
    }
  }
  return (
    <Button
      renderIcon={playIcon}
      color={playback ? 'success' : 'primary'}
      margin="xxx-small"
      size="medium"
      onClick={generateAndSelectMedia}
    >
      {playText}
    </Button>
  );
};
