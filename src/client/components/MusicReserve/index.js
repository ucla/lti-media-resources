import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { Breadcrumb } from '@instructure/ui-breadcrumb';
import { IconArrowOpenStartSolid } from '@instructure/ui-icons';
import { AlbumTable } from './AlbumTable';
import { TrackTable } from './TrackTable';
import { MediaPlayer } from '../MediaPlayer';

import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

export const MusicReserve = ({ userid }) => {
  MusicReserve.propTypes = {
    userid: PropTypes.number.isRequired,
  };

  const [allAlbums, setAllAlbums] = useState([]);
  const retrieveMusicRes = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/medias/musicres?ltik=${ltik}`).then(res => {
        setAllAlbums(res.data);
      });
    });
  };
  useEffect(retrieveMusicRes, []);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const handleAlbumClick = event => {
    const clickedAlbum = allAlbums.filter(
      album => album.title.trim() === event.target.innerText.trim()
    )[0];
    const { items } = clickedAlbum;
    if (items.length === 1) {
      const musicToBeSet = items[0];
      musicToBeSet.type = clickedAlbum.isVideo ? 'video' : 'audio';
      if (
        !musicToBeSet.trackTitle ||
        musicToBeSet.trackTitle === '' ||
        musicToBeSet.trackTitle === 'N/A'
      ) {
        musicToBeSet.trackTitle = clickedAlbum.title;
      }
      if (!musicToBeSet.url) {
        musicToBeSet.url = musicToBeSet.httpURL;
        delete musicToBeSet.httpURL;
        delete musicToBeSet.rtmpURL;
      }
      musicToBeSet._id = clickedAlbum._id;
      setSelectedMusic(musicToBeSet);
    } else {
      setSelectedAlbum(clickedAlbum);
    }
  };
  const handleTrackClick = event => {
    const clickedMusic = selectedAlbum.items.filter(
      item => item.trackTitle.trim() === event.target.innerText.trim()
    )[0];
    clickedMusic.url = clickedMusic.httpURL;
    clickedMusic.type = selectedAlbum.isVideo ? 'video' : 'audio';
    clickedMusic._id = selectedAlbum._id;
    setSelectedMusic(clickedMusic);
  };
  const deselectAlbum = () => {
    setSelectedAlbum(null);
  };
  const deselectTrack = () => {
    setSelectedMusic(null);
  };
  const deselectBoth = () => {
    deselectTrack();
    deselectAlbum();
  };

  if (selectedMusic && selectedAlbum) {
    return (
      <View>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link onClick={deselectBoth}>All Albums</Breadcrumb.Link>
          <Breadcrumb.Link onClick={deselectTrack}>
            {selectedAlbum.title}
          </Breadcrumb.Link>
          <Breadcrumb.Link>{selectedMusic.trackTitle}</Breadcrumb.Link>
        </Breadcrumb>
        <Button
          onClick={deselectTrack}
          color="primary"
          margin="medium"
          renderIcon={IconArrowOpenStartSolid}
        >
          Back
        </Button>
        <MediaPlayer
          media={selectedMusic}
          userid={userid}
          tab={constants.TAB_DIGITAL_AUDIO_RESERVES}
        />
      </View>
    );
  }
  if (selectedMusic) {
    return (
      <View>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link onClick={deselectTrack}>All Albums</Breadcrumb.Link>
          <Breadcrumb.Link>{selectedMusic.trackTitle}</Breadcrumb.Link>
        </Breadcrumb>
        <Button
          onClick={deselectTrack}
          color="primary"
          margin="medium"
          renderIcon={IconArrowOpenStartSolid}
        >
          Back
        </Button>
        <MediaPlayer
          media={selectedMusic}
          userid={userid}
          tab={constants.TAB_DIGITAL_AUDIO_RESERVES}
        />
      </View>
    );
  }
  if (selectedAlbum) {
    return (
      <View>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link onClick={deselectAlbum}>All Albums</Breadcrumb.Link>
          <Breadcrumb.Link>{selectedAlbum.title}</Breadcrumb.Link>
        </Breadcrumb>
        <Button
          onClick={deselectAlbum}
          color="primary"
          margin="medium"
          renderIcon={IconArrowOpenStartSolid}
        >
          Back
        </Button>
        <TrackTable album={selectedAlbum} handleClick={handleTrackClick} />
      </View>
    );
  }
  return (
    <View>
      <Breadcrumb size="large" label="Album navigation">
        <Breadcrumb.Link onClick={deselectBoth}>All Albums</Breadcrumb.Link>
      </Breadcrumb>
      <AlbumTable allAlbums={allAlbums} handleClick={handleAlbumClick} />
    </View>
  );
};
