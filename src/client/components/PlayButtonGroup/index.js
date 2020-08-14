import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({
  audio,
  video,
  selectMedia,
  course,
  tab,
  eventMediaTitle,
  playbackMap,
  finishedMap,
}) => {
  PlayButtonGroup.propTypes = {
    audio: PropTypes.string,
    video: PropTypes.string,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    tab: PropTypes.number,
    eventMediaTitle: PropTypes.object,
    playbackMap: PropTypes.object,
    finishedMap: PropTypes.object,
  };

  const audioArray = [];
  if (audio && audio.length !== 0 && audio !== '') {
    const audioStrs = audio.split(',');
    for (const audioStr of audioStrs) {
      let currPlayback = null;
      let currFinished = null;
      if (playbackMap && playbackMap.has(audioStr)) {
        currPlayback = playbackMap.get(audioStr);
      }
      if (finishedMap && finishedMap.has(audioStr)) {
        currFinished = finishedMap.get(audioStr);
      }
      audioArray.push({
        src: audioStr,
        playback: currPlayback,
        finished: currFinished,
      });
    }
  }
  const videoArray = [];
  if (video && video.length !== 0 && video !== '') {
    const videoStrs = video.split(',');
    for (const videoStr of videoStrs) {
      let currPlayback = null;
      let currFinished = null;
      if (playbackMap && playbackMap.has(videoStr)) {
        currPlayback = playbackMap.get(videoStr);
      }
      if (finishedMap && finishedMap.has(videoStr)) {
        currFinished = finishedMap.get(videoStr);
      }
      videoArray.push({
        src: videoStr,
        playback: currPlayback,
        finished: currFinished,
      });
    }
  }

  return (
    <View>
      {audioArray &&
        Array.isArray(audioArray) &&
        audioArray.length !== 0 &&
        audioArray.map(currAudio => (
          <View key={currAudio.src}>
            <PlayButton
              key={currAudio.src}
              type="audio"
              selectMedia={selectMedia}
              src={currAudio.src}
              course={course}
              file={currAudio.src}
              tab={tab}
              eventMediaTitle={eventMediaTitle}
              playback={currAudio.playback}
              finished={currAudio.finished}
            />
          </View>
        ))}
      {videoArray &&
        Array.isArray(videoArray) &&
        videoArray.length !== 0 &&
        videoArray.map(currVideo => (
          <View key={currVideo.src}>
            <PlayButton
              key={currVideo.src}
              type="video"
              selectMedia={selectMedia}
              src={currVideo.src}
              course={course}
              file={currVideo.src}
              tab={tab}
              eventMediaTitle={eventMediaTitle}
              playback={currVideo.playback}
              finished={currVideo.finished}
            />
          </View>
        ))}
    </View>
  );
};
