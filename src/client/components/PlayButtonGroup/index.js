import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({ audio, video, selectMedia, course, _id }) => {
  PlayButtonGroup.propTypes = {
    audio: PropTypes.string,
    video: PropTypes.string,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    _id: PropTypes.string,
  };

  let audioButton = null;
  if (audio && audio.length !== 0 && audio !== '') {
    audioButton = (
      <PlayButton
        key={audio}
        type="audio"
        selectMedia={selectMedia}
        src={audio}
        course={course}
        _id={_id}
      />
    );
  }

  let videoButton = null;
  if (video && video.length !== 0 && video !== '') {
    videoButton = (
      <PlayButton
        key={video}
        type="video"
        selectMedia={selectMedia}
        src={video}
        course={course}
        _id={_id}
      />
    );
  }

  return (
    <View>
      {audioButton}
      {videoButton}
    </View>
  );
};
