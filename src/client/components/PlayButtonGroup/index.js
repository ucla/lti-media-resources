import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({ audios, videos, selectMedia, course }) => {
  PlayButtonGroup.propTypes = {
    audios: PropTypes.array,
    videos: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
  };

  let audioButtons = null;
  if (audios && audios.length !== 0 && audios[0] !== '') {
    audioButtons = audios
      .filter(audio => audio !== '')
      .map(audio => (
        <PlayButton
          type="audio"
          selectMedia={selectMedia}
          src={audio}
          course={course}
        />
      ));
  }

  let videoButtons = null;
  if (videos && videos.length !== 0 && videos[0] !== '') {
    videoButtons = videos
      .filter(video => video !== '')
      .map(video => (
        <PlayButton
          type="video"
          selectMedia={selectMedia}
          src={video}
          course={course}
        />
      ));
  }

  return (
    <View>
      {audioButtons}
      {videoButtons}
    </View>
  );
};
