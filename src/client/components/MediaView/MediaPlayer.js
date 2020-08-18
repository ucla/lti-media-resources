import React, { Component } from 'react';
import ReactJWPlayer from 'react-jw-player';
import PropTypes from 'prop-types';
import axios from 'axios';

import axiosRetry from 'axios-retry';
import { ltikPromise } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export class MediaPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = { playbackPos: 0, finished: false };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { media } = this.props;
    const { url, format } = media;
    return nextProps.media.url !== url || nextProps.media.format !== format;
  }

  componentWillUnmount() {
    const { playbackPos, finished } = this.state;
    const {
      userid,
      media,
      mediaType,
      hotReloadPlayback,
      setError,
    } = this.props;
    const player = window.jwplayer(media._id);
    const duration = player.getDuration();
    let time = playbackPos;
    if (finished) {
      time = 0;
    }
    const remaining = duration - time;
    ltikPromise.then(ltik => {
      axios
        .post(`/api/medias/playback?ltik=${ltik}`, {
          userid,
          file: media.file,
          mediaType,
          classShortname: media.classShortname,
          time,
          remaining,
          finished,
        })
        .then(() => {
          if (mediaType === constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES) {
            hotReloadPlayback(
              media.albumTitle,
              media.file,
              time,
              remaining,
              finished
            );
          } else if (mediaType === constants.MEDIA_TYPE.BRUINCAST) {
            hotReloadPlayback(
              media.classShortname,
              media.file,
              time,
              remaining,
              finished
            );
          } else if (mediaType === constants.MEDIA_TYPE.VIDEO_RESERVES) {
            hotReloadPlayback(media.file, time, remaining, finished);
          }
          setError(null);
        })
        .catch(err => {
          setError({
            err,
            msg: 'Something went wrong when uploading playback history...',
          });
        });
    });
  }

  render() {
    const { media } = this.props;
    const { url, format } = media;
    let imageURL = '';
    if (format === 'audio' || format === 'a') {
      imageURL =
        'https://www.shutupandtakemymoney.com/wp-content/uploads/2020/04/zoom-meeting-audio-vs-video-meme.jpg';
    }
    return (
      <ReactJWPlayer
        playerId={media._id}
        playerScript="https://cdn.jwplayer.com/libraries/q3GUgsN9.js"
        file={url}
        image={imageURL}
        onReady={() => {
          if (media.playback && media.playback !== 0) {
            const player = window.jwplayer(media._id);
            player.seek(media.playback);
          }
        }}
        onTime={event => {
          this.state.playbackPos = event.position;
        }}
        onNinetyFivePercent={() => {
          this.state.finished = true;
        }}
      />
    );
  }
}

MediaPlayer.propTypes = {
  media: PropTypes.object.isRequired,
  userid: PropTypes.number.isRequired,
  mediaType: PropTypes.number.isRequired,
  hotReloadPlayback: PropTypes.func,
  setError: PropTypes.func,
};
