import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { View } from '@instructure/ui-view';
import { CondensedButton } from '@instructure/ui-buttons';
import { AlbumTable } from './AlbumTable';
import { TrackTable } from './TrackTable';
import { MediaPlayer } from '../MediaPlayer';

import { ltikPromise } from '../../services/ltik';

export const MusicReserve = () => {
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
      items[0].type = clickedAlbum.isVideo ? 'video' : 'audio';
      setSelectedMusic(items[0]);
    } else {
      setSelectedAlbum(clickedAlbum);
    }
  };
  const handleTrackClick = event => {
    const clickedMusic = selectedAlbum.items.filter(
      item => item.trackTitle.trim() === event.target.innerText.trim()
    )[0];
    setSelectedMusic(clickedMusic);
  };
  const deselectAlbum = () => {
    setSelectedAlbum(null);
  };

  if (selectedMusic) {
    return (
      <View>
        <CondensedButton
          onClick={() => {
            setSelectedMusic(null);
          }}
          display="block"
          margin="medium"
        >
          {'< Back'}
        </CondensedButton>
        <MediaPlayer
          mediaURL={selectedMusic.httpURL}
          type={selectedMusic.type}
        />
      </View>
    );
  }
  if (selectedAlbum) {
    return (
      <View>
        <TrackTable
          album={selectedAlbum}
          handleClick={handleTrackClick}
          goBack={deselectAlbum}
        />
      </View>
    );
  }
  return (
    <View>
      <AlbumTable allAlbums={allAlbums} handleClick={handleAlbumClick} />
    </View>
  );
};
