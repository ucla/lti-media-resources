import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { Breadcrumb } from '@instructure/ui-breadcrumb';
import {
  IconArrowOpenStartSolid,
  IconAnalyticsSolid,
} from '@instructure/ui-icons';
import axiosRetry from 'axios-retry';
import { AlbumTable } from './AlbumTable';
import { TrackTable } from './TrackTable';
import { MediaView } from '../MediaView';
import { Analytics } from '../Analytics';

import { getLtik } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export const MusicReserve = ({ userid, isInstructorOrAdmin, setError }) => {
  MusicReserve.propTypes = {
    userid: PropTypes.number.isRequired,
    isInstructorOrAdmin: PropTypes.bool,
    setError: PropTypes.func,
  };

  const [allAlbums, setAllAlbums] = useState([]);
  const retrieveMusicRes = () => {
    const ltik = getLtik();
    axios
      .get(`/api/medias/musicres?ltik=${ltik}`)
      .then(res => {
        setAllAlbums(res.data);
        setError(null);
      })
      .catch(err => {
        setError({
          err,
          msg: 'Something went wrong when retrieving Digital Audio Reserves...',
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

  const [analytics, setAnalytics] = useState(null);
  const retrieveAnalytics = () => {
    if (isInstructorOrAdmin) {
      const ltik = getLtik();
      axios.get(`/api/medias/musicres/analytics?ltik=${ltik}`).then(res => {
        setAnalytics(res.data);
      });
    }
  };
  useEffect(retrieveAnalytics, [isInstructorOrAdmin]);

  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const showAnalytics = () => {
    setShowingAnalytics(!showingAnalytics);
  };

  if (analytics && showingAnalytics) {
    return (
      <>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link>Analytics</Breadcrumb.Link>
        </Breadcrumb>
        <Button
          onClick={showAnalytics}
          margin="medium 0"
          color="primary"
          renderIcon={<IconArrowOpenStartSolid />}
        >
          Back
        </Button>
        <Analytics analytics={analytics} />
      </>
    );
  }

  if (selectedMusic && selectedAlbum) {
    return (
      <>
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
          mediaType={constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES}
          hotReloadPlayback={hotReloadPlayback}
          deSelectMedia={deselectTrack}
          setError={setError}
        />
      </>
    );
  }
  if (selectedMusic) {
    return (
      <>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link onClick={deselectTrack}>All Albums</Breadcrumb.Link>
          <Breadcrumb.Link>{selectedMusic.trackTitle}</Breadcrumb.Link>
        </Breadcrumb>
        <MediaView
          media={selectedMusic}
          userid={userid}
          mediaType={constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES}
          hotReloadPlayback={hotReloadPlayback}
          deSelectMedia={deselectTrack}
          setError={setError}
        />
      </>
    );
  }
  if (selectedAlbum) {
    return (
      <>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link onClick={deselectAlbum}>All Albums</Breadcrumb.Link>
          <Breadcrumb.Link>{selectedAlbum.title}</Breadcrumb.Link>
        </Breadcrumb>
        <Button
          onClick={showAnalytics}
          margin="medium 0"
          color="primary"
          renderIcon={<IconAnalyticsSolid />}
        >
          Analytics
        </Button>
        <br />
        <Button
          onClick={deselectAlbum}
          color="primary"
          margin="medium none"
          renderIcon={IconArrowOpenStartSolid}
        >
          Back
        </Button>
        <TrackTable
          album={selectedAlbum}
          handleClick={handleTrackClick}
          setError={setError}
        />
      </>
    );
  }
  return (
    <>
      <Breadcrumb size="large" label="Album navigation">
        <Breadcrumb.Link onClick={deselectBoth}>All Albums</Breadcrumb.Link>
      </Breadcrumb>
      <Button
        onClick={showAnalytics}
        margin="medium 0"
        color="primary"
        renderIcon={<IconAnalyticsSolid />}
      >
        Analytics
      </Button>
      <AlbumTable
        allAlbums={allAlbums}
        handleClick={handleAlbumClick}
        setError={setError}
      />
    </>
  );
};
