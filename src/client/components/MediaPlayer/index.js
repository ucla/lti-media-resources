import React, { Component } from 'react';
import ReactJWPlayer from 'react-jw-player';
import PropTypes from 'prop-types';
import axios from 'axios';

import { ltikPromise } from '../../services/ltik';

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
    const { userid, media, tab } = this.props;
    ltikPromise.then(ltik => {
      const mediaIdentifiers = {
        _id: media._id,
      };
      if (media.trackTitle) {
        mediaIdentifiers.trackTitle = media.trackTitle;
        mediaIdentifiers.volume = media.volume;
        mediaIdentifiers.disc = media.disc;
        mediaIdentifiers.side = media.side;
        mediaIdentifiers.trackNumber = media.trackNumber;
      }
      axios
        .post(`/api/medias/playback?ltik=${ltik}`, {
          userid,
          media: mediaIdentifiers,
          tab,
          time: playbackPos,
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  onReady() {
    const player = window.jwplayer(this.playerId);
    player.seek(60);
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
        onReady={this.onReady}
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
};
