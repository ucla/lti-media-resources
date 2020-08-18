import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Button } from '@instructure/ui-buttons';
import { IconVideoSolid, IconAudioSolid } from '@instructure/ui-icons';

import { ltikPromise } from '../../services/ltik';

const constants = require('../../../../constants');

export const PlayButton = ({
  format,
  selectMedia,
  src,
  course,
  file,
  mediaType,
  eventMediaTitle,
  playback,
  remaining,
  finished,
  disabled,
}) => {
  PlayButton.propTypes = {
    format: PropTypes.string,
    selectMedia: PropTypes.func,
    src: PropTypes.string,
    course: PropTypes.object,
    file: PropTypes.string,
    mediaType: PropTypes.number,
    eventMediaTitle: PropTypes.object,
    playback: PropTypes.number,
    remaining: PropTypes.number,
    finished: PropTypes.number,
    disabled: PropTypes.bool,
  };
  const generateAndSelectMedia = () => {
    if (
      mediaType === constants.MEDIA_TYPE.BRUINCAST ||
      mediaType === constants.MEDIA_TYPE.VIDEO_RESERVES
    ) {
      ltikPromise.then(ltik => {
        axios
          .get(`/api/medias/url?ltik=${ltik}`, {
            params: {
              mediatype: mediaType,
              mediaformat: format.charAt(0),
              filename: src,
              quarter: course.quarter,
            },
          })
          .then(res => {
            const mediaToBeSelected = {
              format,
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

  let playIcon = <IconVideoSolid />;
  if (format === 'audio') {
    playIcon = <IconAudioSolid />;
  }

  let playText = 'Play';
  if (disabled) {
    playText = 'Unavailable';
  } else if (playback && playback >= 1 && remaining && remaining >= 1) {
    let timeText = '';
    const timeInt = Math.floor(remaining);
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
      timeText = `${min}:${sec}`;
    } else {
      timeText = `${hour}:${min}:${sec}`;
    }
    if (finished) {
      playText = `Rewatch (${timeText} left)`;
    } else {
      playText = `Resume (${timeText} left)`;
    }
  } else if (finished) {
    playText = 'Play again';
  }

  const playColor = finished ? 'success' : 'primary';

  return (
    <Button
      renderIcon={playIcon}
      color={playColor}
      margin="xxx-small"
      size="medium"
      onClick={generateAndSelectMedia}
      textAlign="start"
      interaction={disabled ? 'disabled' : 'enabled'}
    >
      {playText}
    </Button>
  );
};
