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

export const Bruincast = ({ course, warning, retrieveWarning, crosslist }) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    warning: PropTypes.string,
    retrieveWarning: PropTypes.func,
    crosslist: PropTypes.array,
  };

  // Get bruincast medias for all crosslisted courses
  const [castsByCourses, setCasts] = useState([]);
  const retrieveCasts = () => {
    if (crosslist && crosslist.length !== 0) {
      ltikPromise.then(async ltik => {
        const tmpCastsByCourses = [];
        for (const currCourse of crosslist) {
          const res = await axios.get(
            `/api/medias/bruincast/casts?ltik=${ltik}`,
            {
              params: {
                courseLabel: currCourse.label,
              },
            }
          );
          const medias = res.data;
          for (const media of medias) {
            media.date = new Date(media.date);
          }
          tmpCastsByCourses.push({
            course: currCourse,
            casts: medias,
          });
        }
        setCasts(tmpCastsByCourses);
      });
    }
  };
  useEffect(retrieveCasts, [crosslist]);

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
        <View>{selectedMedia.url}</View>
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
            renderTitle={currCourse.course.label}
            selected={courseIndex === i}
          >
            <BruincastTable
              casts={currCourse.casts}
              selectMedia={selectMedia}
              course={currCourse.course}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </View>
  );
};
