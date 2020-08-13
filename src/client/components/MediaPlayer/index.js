import React, { Component } from 'react';
import ReactJWPlayer from 'react-jw-player';
import PropTypes from 'prop-types';
import axios from 'axios';

import { ltikPromise } from '../../services/ltik';

const constants = require('../../../../constants');

export class MediaPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = { playbackPos: 0 };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { media } = this.props;
    const { url, type } = media;
    return nextProps.media.url !== url || nextProps.media.type !== type;
  }

  componentWillUnmount() {
    const { playbackPos } = this.state;
    const { userid, media, tab, hotReloadPlayback } = this.props;
    ltikPromise.then(ltik => {
      axios
        .post(`/api/medias/playback?ltik=${ltik}`, {
          userid,
          file: media.file,
          tab,
          classShortname: media.classShortname,
          time: playbackPos,
        })
        .then(() => {
          if (tab === constants.TAB_DIGITAL_AUDIO_RESERVES) {
            hotReloadPlayback(media.albumTitle, media.file, playbackPos);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  render() {
    const { media } = this.props;
    const { url, type } = media;
    let imageURL = '';
    if (type === 'audio' || type === 'a') {
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
      />
    );
  }
}

MediaPlayer.propTypes = {
  media: PropTypes.object.isRequired,
  userid: PropTypes.number.isRequired,
  tab: PropTypes.number.isRequired,
  hotReloadPlayback: PropTypes.func,
};
