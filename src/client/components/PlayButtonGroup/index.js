import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({ audios, videos, selectMediaURL }) => {
  PlayButtonGroup.propTypes = {
    audios: PropTypes.array,
    videos: PropTypes.array,
    selectMediaURL: PropTypes.func,
  };

  let audioButtons = null;
  if (audios && audios.length !== 0 && audios[0] !== '') {
    audioButtons = audios
      .filter(audio => audio !== '')
      .map(audio => (
        <PlayButton type="audio" selectMediaURL={selectMediaURL} src={audio} />
      ));
  }

  let videoButtons = null;
  if (videos && videos.length !== 0 && videos[0] !== '') {
    videoButtons = videos
      .filter(video => video !== '')
      .map(video => (
        <PlayButton type="video" selectMediaURL={selectMediaURL} src={video} />
      ));
  }

  return (
    <View>
      {audioButtons}
      {videoButtons}
    </View>
  );
};
