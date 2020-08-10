import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({
  media,
  audio,
  video,
  selectMedia,
  course,
}) => {
  PlayButtonGroup.propTypes = {
    media: PropTypes.string,
    audio: PropTypes.string,
    video: PropTypes.string,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
  };

  let audioButton = null;
  if (audio && audio.length !== 0 && audio !== '') {
    audioButton = (
      <PlayButton
        key={audio}
        media={media}
        format="audio"
        selectMedia={selectMedia}
        file={audio}
        course={course}
      />
    );
  }

  let videoButton = null;
  if (video && video.length !== 0 && video !== '') {
    videoButton = (
      <PlayButton
        key={video}
        media={media}
        format="video"
        selectMedia={selectMedia}
        file={video}
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
