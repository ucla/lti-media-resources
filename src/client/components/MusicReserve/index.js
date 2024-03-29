import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { Button } from '@instructure/ui-buttons';
import { Breadcrumb } from '@instructure/ui-breadcrumb';
import { IconArrowOpenStartSolid } from '@instructure/ui-icons';
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

  // Get all albums from back-end
  const [allAlbums, setAllAlbums] = useState([]);
  const retrieveMusicRes = () => {
    const ltik = getLtik();
    axios
      .get(`${process.env.LTI_APPROUTE}/api/medias/musicres?ltik=${ltik}`)
      .then((res) => {
        setAllAlbums(res.data);
        // If empty casts array, display "No media found" alert.
        if (res.data.length === 0) {
          setError({
            err: '',
            msg: 'No Digital Audio Reserves media found.',
          });
        } else {
          setError(null);
        }
      })
      .catch((err) => {
        setError({
          err,
          msg: 'Something went wrong when retrieving Digital Audio Reserves...',
        });
      });
  };
  // Loads music reserves (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveMusicRes, []);

  // State that indicates a user's selected album and selected track within the album
  // Use those state to navigate through albums and tracks, and determine what to display
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  // Onclick functions that handle album / track selection
  const handleAlbumClick = (event) => {
    const clickedAlbum = allAlbums.filter(
      (album) => album.title.trim() === event.target.innerText.trim()
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
  const handleTrackClick = (event) => {
    const clickedMusic = selectedAlbum.items.filter(
      (item) => item.trackTitle.trim() === event.target.innerText.trim()
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

  // After users stop watching a video, their progress are updated and displayed immediately
  // This function is fed to MediaPlayer as a prop
  const hotReloadPlayback = (
    albumTitle,
    trackFile,
    playback,
    remaining,
    finished
  ) => {
    const albumsToBeSet = allAlbums;
    const itemToBeSet = albumsToBeSet
      .filter((album) => album.title === albumTitle)[0]
      .items.filter((item) => item.httpURL === trackFile)[0];
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

  // Get analytics data if user is instructor or admin
  const [analytics, setAnalytics] = useState(null);
  const retrieveAnalytics = () => {
    if (isInstructorOrAdmin) {
      const ltik = getLtik();
      axios
        .get(`${process.env.LTI_APPROUTE}/api/medias/analytics?ltik=${ltik}`, {
          params: { mediaType: constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES },
        })
        .then((res) => {
          setAnalytics(res.data);
        });
    }
  };
  useEffect(retrieveAnalytics, [isInstructorOrAdmin]);

  // State indicating if the user sees analytics or music reserves table
  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const showAnalytics = () => {
    setShowingAnalytics(!showingAnalytics);
  };

  if (analytics && showingAnalytics) {
    return (
      <>
        <Breadcrumb size="large" label="Album navigation">
          <Breadcrumb.Link
            onClick={() => {
              showAnalytics();
              deselectAlbum();
            }}
          >
            All Albums
          </Breadcrumb.Link>
          {selectedAlbum && (
            <Breadcrumb.Link onClick={showAnalytics}>
              {selectedAlbum.title}
            </Breadcrumb.Link>
          )}
          <Breadcrumb.Link>Analytics</Breadcrumb.Link>
        </Breadcrumb>
        <Analytics
          analytics={analytics}
          showing={showingAnalytics}
          show={showAnalytics}
        />
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
        {analytics && (
          <Analytics showing={showingAnalytics} show={showAnalytics} />
        )}
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
      {analytics && (
        <Analytics showing={showingAnalytics} show={showAnalytics} />
      )}
      <AlbumTable
        allAlbums={allAlbums}
        handleClick={handleAlbumClick}
        setError={setError}
      />
    </>
  );
};
