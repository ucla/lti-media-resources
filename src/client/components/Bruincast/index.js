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

import { CondensedButton } from '@instructure/ui-buttons';
import { BruincastTable } from './BruincastTable';
import { MediaPlayer } from '../MediaPlayer';

import { ltikPromise } from '../../services/ltik';

export const Bruincast = ({ course, warning, retrieveWarning }) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    warning: PropTypes.string,
    retrieveWarning: PropTypes.func,
  };

  // Get bruincast medias for all crosslisted courses
  const [castsByCourses, setCasts] = useState([]);
  const retrieveCasts = () => {
    ltikPromise.then(async ltik => {
      axios.get(`/api/medias/bruincast/casts?ltik=${ltik}`).then(res => {
        const tmpCastsByCourses = res.data;
        for (const tmpCourse of tmpCastsByCourses) {
          for (const tmpCast of tmpCourse.casts) {
            tmpCast.date = new Date(tmpCast.date);
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
        <MediaPlayer mediaURL={selectedMedia.url} type={selectedMedia.type} />
        <CondensedButton
          onClick={deselectMedia}
          display="block"
          margin="medium"
        >
          {'< Back'}
        </CondensedButton>
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
