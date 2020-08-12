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
import { Button } from '@instructure/ui-buttons';
import { IconArrowOpenStartSolid } from '@instructure/ui-icons';
import { BruincastTable } from './BruincastTable';
import { MediaPlayer } from '../MediaPlayer';

import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

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
              for (const tmpPlayback of tmpCast.playbackArr) {
                playbackMap.set(tmpPlayback.file, tmpPlayback.playback);
              }
              tmpCast.playbackMap = playbackMap;
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
    selectedMedia.type &&
    selectedMedia.type !== ''
  ) {
    return (
      <View>
        <Button
          onClick={deselectMedia}
          color="primary"
          margin="medium"
          renderIcon={IconArrowOpenStartSolid}
        >
          Back
        </Button>
        <MediaPlayer
          media={selectedMedia}
          userid={userid}
          tab={constants.TAB_BRUINCAST}
        />
      </View>
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
