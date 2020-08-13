import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({ audio, video, selectMedia, course, tab }) => {
  PlayButtonGroup.propTypes = {
    audio: PropTypes.string,
    video: PropTypes.string,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    tab: PropTypes.number,
  };

  let audioButton = null;
  if (audio && audio.length !== 0 && audio !== '') {
    audioButton = (
      <PlayButton
        key={audio}
        format="audio"
        selectMedia={selectMedia}
        file={audio}
        course={course}
        tab={tab}
        disabled={false}
      />
    );
  }

  let videoButton = null;
  if (video && video.length !== 0 && video !== '') {
    videoButton = (
      <PlayButton
        key={video}
        format="video"
        selectMedia={selectMedia}
        file={video}
        course={course}
        tab={tab}
        disabled={false}
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
