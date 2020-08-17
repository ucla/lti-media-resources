import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { Breadcrumb } from '@instructure/ui-breadcrumb';
import { IconArrowOpenStartSolid } from '@instructure/ui-icons';
import { AlbumTable } from './AlbumTable';
import { TrackTable } from './TrackTable';
import { MediaView } from '../MediaView';

import { ltikPromise } from '../../services/ltik';

const constants = require('../../../../constants');

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
      musicToBeSet.format = clickedAlbum.isVideo ? 'video' : 'audio';
      if (
        !musicToBeSet.trackTitle ||
        musicToBeSet.trackTitle === '' ||
        musicToBeSet.trackTitle === 'N/A'
      ) {
        musicToBeSet.trackTitle = clickedAlbum.title;
      }
      if (!musicToBeSet.url) {
        musicToBeSet.url = musicToBeSet.httpURL;
      }
      musicToBeSet.file = musicToBeSet.url;
      musicToBeSet.classShortname = clickedAlbum.classShortname;
      musicToBeSet._id = clickedAlbum._id;
      musicToBeSet.albumTitle = clickedAlbum.title;
      if (event.playback !== undefined && event.playback !== null) {
        musicToBeSet.playback = event.playback;
      }
      setSelectedMusic(musicToBeSet);
    } else {
      setSelectedAlbum(clickedAlbum);
    }
  };
  const handleTrackClick = event => {
    const clickedMusic = selectedAlbum.items.filter(
      item => item.trackTitle.trim() === event.target.innerText.trim()
    )[0];
    if (!clickedMusic.url) {
      clickedMusic.url = clickedMusic.httpURL;
    }
    clickedMusic.file = clickedMusic.url;
    clickedMusic.classShortname = selectedAlbum.classShortname;
    clickedMusic.format = selectedAlbum.isVideo ? 'video' : 'audio';
    clickedMusic._id = selectedAlbum._id;
    clickedMusic.albumTitle = selectedAlbum.title;
    if (event.playback !== undefined && event.playback !== null) {
      clickedMusic.playback = event.playback;
    }
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

  const hotReloadPlayback = (
    albumTitle,
    trackFile,
    playback,
    remaining,
    finished
  ) => {
    const albumsToBeSet = allAlbums;
    const itemToBeSet = albumsToBeSet
      .filter(album => album.title === albumTitle)[0]
      .items.filter(item => item.httpURL === trackFile)[0];
    itemToBeSet.playback = playback;
    itemToBeSet.remaining = remaining;
    if (finished) {
      if (itemToBeSet.finished) {
        itemToBeSet.finished += 1;
      } else {
        itemToBeSet.finished = 1;
      }
    }
    // Change object referenced by state to trigger component reload
    setAllAlbums([]);
    setAllAlbums(albumsToBeSet);
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
        <MediaView
          media={selectedMusic}
          userid={userid}
          tab={constants.TABS.DIGITAL_AUDIO_RESERVES}
          hotReloadPlayback={hotReloadPlayback}
          deSelectMedia={deselectTrack}
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
        <MediaView
          media={selectedMusic}
          userid={userid}
          tab={constants.TABS.DIGITAL_AUDIO_RESERVES}
          hotReloadPlayback={hotReloadPlayback}
          deSelectMedia={deselectTrack}
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
