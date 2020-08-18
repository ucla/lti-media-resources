import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { media } from '@instructure/canvas-theme';
import { PlayButton } from './PlayButton';

export const PlayButtonGroup = ({
  audio,
  video,
  selectMedia,
  course,
  mediaType,
  eventMediaTitle,
  playbackMap,
  remainingMap,
  finishedMap,
}) => {
  PlayButtonGroup.propTypes = {
    audio: PropTypes.string,
    video: PropTypes.string,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    mediaType: PropTypes.number,
    eventMediaTitle: PropTypes.object,
    playbackMap: PropTypes.object,
    remainingMap: PropTypes.object,
    finishedMap: PropTypes.object,
  };

  const audioArray = [];
  if (audio && audio.length !== 0 && audio !== '') {
    const audioStrs = audio.split(',');
    for (const audioStr of audioStrs) {
      let currPlayback = null;
      let currRemaining = null;
      let currFinished = null;
      if (playbackMap && playbackMap.has(audioStr)) {
        currPlayback = playbackMap.get(audioStr);
      }
      if (remainingMap && remainingMap.has(audioStr)) {
        currRemaining = remainingMap.get(audioStr);
      }
      if (finishedMap && finishedMap.has(audioStr)) {
        currFinished = finishedMap.get(audioStr);
      }
      audioArray.push({
        src: audioStr,
        playback: currPlayback,
        remaining: currRemaining,
        finished: currFinished,
      });
    }
  }
  const videoArray = [];
  if (video && video.length !== 0 && video !== '') {
    const videoStrs = video.split(',');
    for (const videoStr of videoStrs) {
      let currPlayback = null;
      let currRemaining = null;
      let currFinished = null;
      if (playbackMap && playbackMap.has(videoStr)) {
        currPlayback = playbackMap.get(videoStr);
      }
      if (remainingMap && remainingMap.has(videoStr)) {
        currRemaining = remainingMap.get(videoStr);
      }
      if (finishedMap && finishedMap.has(videoStr)) {
        currFinished = finishedMap.get(videoStr);
      }
      videoArray.push({
        src: videoStr,
        playback: currPlayback,
        remaining: currRemaining,
        finished: currFinished,
      });
    }
  }

  return (
    <View>
      {videoArray &&
        Array.isArray(videoArray) &&
        videoArray.length !== 0 &&
        videoArray.map((currVideo, i) => (
          <View key={currVideo.src}>
            {i !== 0 && <br />}
            <PlayButton
              key={currVideo.src}
              format="video"
              selectMedia={selectMedia}
              src={currVideo.src}
              course={course}
              file={currVideo.src}
              mediaType={mediaType}
              eventMediaTitle={eventMediaTitle}
              playback={currVideo.playback}
              remaining={currVideo.remaining}
              finished={currVideo.finished}
              disabled={false}
            />
          </View>
        ))}
      {videoArray.length !== 0 && <br />}
      {audioArray &&
        Array.isArray(audioArray) &&
        audioArray.length !== 0 &&
        audioArray.map((currAudio, i) => (
          <View key={currAudio.src}>
            {i !== 0 && <br />}
            <PlayButton
              key={currAudio.src}
              format="audio"
              selectMedia={selectMedia}
              src={currAudio.src}
              course={course}
              file={currAudio.src}
              mediaType={media}
              eventMediaTitle={eventMediaTitle}
              playback={currAudio.playback}
              remaining={currAudio.remaining}
              finished={currAudio.finished}
              disabled={false}
            />
          </View>
        ))}
    </View>
  );
};
