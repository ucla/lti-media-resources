import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({ audio, video, selectMedia, course }) => {
  PlayButtonGroup.propTypes = {
    audio: PropTypes.array,
    video: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
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
