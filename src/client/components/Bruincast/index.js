/* eslint-disable react/no-danger */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { View } from '@instructure/ui-view';
import { Tabs } from '@instructure/ui-tabs';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Text } from '@instructure/ui-text';
import { Link } from '@instructure/ui-link';
import { BruincastTable } from './BruincastTable';
import { MediaView } from '../MediaView';

import { ltikPromise } from '../../services/ltik';

const constants = require('../../../../constants');

export const Bruincast = ({ course, warning, retrieveWarning, userid }) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    warning: PropTypes.string,
    retrieveWarning: PropTypes.func,
    userid: PropTypes.number,
  };

  // Get bruincast medias for all crosslisted courses
  const [castsByCourses, setCasts] = useState([]);
  const retrieveCasts = () => {
    ltikPromise.then(async ltik => {
      axios.get(`/api/medias/bruincast/casts?ltik=${ltik}`).then(res => {
        const tmpCastsByCourses = res.data;
        for (const tmpCourse of tmpCastsByCourses) {
          for (const listObj of tmpCourse.casts) {
            for (const tmpCast of listObj.listings) {
              const playbackMap = new Map();
              const remainingMap = new Map();
              const finishedMap = new Map();
              for (const tmpPlayback of tmpCast.playbackArr) {
                playbackMap.set(tmpPlayback.file, tmpPlayback.playback);
                remainingMap.set(tmpPlayback.file, tmpPlayback.remaining);
                finishedMap.set(tmpPlayback.file, tmpPlayback.finished);
              }
              tmpCast.playbackMap = playbackMap;
              tmpCast.remainingMap = remainingMap;
              tmpCast.finishedMap = finishedMap;
            }
          }
        }
        setCasts(tmpCastsByCourses);
      });
    });
  };
  useEffect(retrieveCasts, []);

  // Logic when a media is selected and to be played
  // Declaring functions only
  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = obj => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  const hotReloadPlayback = (
    classShortname,
    file,
    playback,
    remaining,
    finished
  ) => {
    const toBeSet = castsByCourses;
    const matchedCourse = toBeSet.filter(
      obj => obj.course.label === classShortname
    )[0];
    for (const listObj of matchedCourse.casts) {
      for (const cast of listObj.listings) {
        if (cast.video.includes(file) || cast.audio.includes(file)) {
          cast.playbackMap.set(file, playback);
          cast.remainingMap.set(file, remaining);
          if (finished) {
            if (cast.finishedMap.has(file)) {
              cast.finishedMap.set(file, cast.finishedMap.get(file) + 1);
            } else {
              cast.finishedMap.set(file, 1);
            }
          }
        }
      }
    }
    // Force reload by state change
    setCasts([]);
    setCasts(toBeSet);
  };

  // Get notice from backend
  useEffect(retrieveWarning, []);

  // Display notice box only when a notice exists
  let warningElement = null;
  if (warning && warning !== '' && warning !== '<p><br></p>') {
    warningElement = (
      <Alert variant="warning" renderCloseButtonLabel="Close">
        <div dangerouslySetInnerHTML={{ __html: warning }} />
      </Alert>
    );
  }

  // Logic for changing tabs
  const [courseIndex, setCourseIndex] = useState(0);
  const handleCourseChange = (event, { index }) => {
    setCourseIndex(index);
  };

  // JSX if playing a media
  if (
    selectedMedia.url &&
    selectedMedia.url !== '' &&
    selectedMedia.format &&
    selectedMedia.format !== ''
  ) {
    return (
      <MediaView
        media={selectedMedia}
        userid={userid}
        mediaType={constants.MEDIA_TYPE.BRUINCAST}
        hotReloadPlayback={hotReloadPlayback}
        deSelectMedia={deselectMedia}
      />
    );
  }

  // JSX if not playing a media
  return (
    <View>
      <Heading>{`Bruincast: ${course.title}`}</Heading>
      {warningElement}
      <Text>
        Video recordings may take up to 24 hours before they are available.{' '}
        <Link href="#">Help</Link>
      </Text>
      <Tabs onRequestTabChange={handleCourseChange} variant="secondary">
        {castsByCourses.map((currCourse, i) => (
          <Tabs.Panel
            id={currCourse.course.label}
            key={currCourse.course.label}
            renderTitle={currCourse.course.label}
            selected={courseIndex === i}
          >
            <BruincastTable
              key={currCourse.course.label}
              casts={currCourse.casts}
              selectMedia={selectMedia}
              course={currCourse.course}
              shortname={currCourse.course.label}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </View>
  );
};
