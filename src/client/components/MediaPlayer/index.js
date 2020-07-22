import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import PropTypes from 'prop-types';

export const MediaPlayer = ({ type, mediaURL }) => {
  MediaPlayer.propTypes = {
    mediaURL: PropTypes.string,
    type: PropTypes.string,
  };
  const onPlayerError = e => {
    console.log(e);
  };

  let imageURL = '';
  if (type === 'audio' || type === 'a') {
    imageURL =
      'https://www.shutupandtakemymoney.com/wp-content/uploads/2020/04/zoom-meeting-audio-vs-video-meme.jpg';
  }

  return (
    <ReactJWPlayer
      playerId="0"
      playerScript="https://cdn.jwplayer.com/libraries/q3GUgsN9.js"
      file={mediaURL}
      image={imageURL}
      onError={onPlayerError}
    />
  );
};
