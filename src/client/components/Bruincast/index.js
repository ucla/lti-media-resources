import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Tabs } from '@instructure/ui-tabs';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Text } from '@instructure/ui-text';
import { Link } from '@instructure/ui-link';

import { CondensedButton } from '@instructure/ui-buttons';
import { BruincastTable } from './BruincastTable';
import { MediaPlayer } from '../MediaPlayer';

export const Bruincast = ({
  course,
  coursesWithCasts,
  retrieveCasts,
  warning,
  retrieveWarning,
}) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    coursesWithCasts: PropTypes.array,
    retrieveCasts: PropTypes.func,
    warning: PropTypes.string,
    retrieveWarning: PropTypes.func,
  };
  useEffect(retrieveCasts, []);

  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = obj => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  useEffect(retrieveWarning, []);

  let warningElement = null;
  if (warning && warning !== '') {
    warningElement = (
      <Alert variant="warning" renderCloseButtonLabel="Close">
        <div dangerouslySetInnerHTML={{ __html: warning }} />
      </Alert>
    );
  }

  const [courseIndex, setCourseIndex] = useState(0);
  const handleCourseChange = (event, { index }) => {
    setCourseIndex(index);
  };

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
  return (
    <View>
      <Heading>{`Bruincast: ${course.title}`}</Heading>
      {warningElement}
      <Text>
        Video recordings may take up to 24 hours before they are available.{' '}
        <Link href="#">Help</Link>
      </Text>
      <Tabs onRequestTabChange={handleCourseChange} variant="secondary">
        {coursesWithCasts.map((currCourse, i) => (
          <Tabs.Panel
            id={currCourse.title}
            renderTitle={currCourse.title}
            selected={courseIndex === i}
          >
            <BruincastTable
              casts={currCourse.casts}
              selectMedia={selectMedia}
              course={currCourse}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </View>
  );
};
