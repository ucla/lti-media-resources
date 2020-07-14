import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Tabs } from '@instructure/ui-tabs';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Text } from '@instructure/ui-text';
import { Link } from '@instructure/ui-link';

import { BruincastTable } from './BruincastTable';

export const Bruincast = ({
  course,
  coursesWithCasts,
  retrieveCasts,
  selectMediaURL,
}) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    coursesWithCasts: PropTypes.array,
    retrieveCasts: PropTypes.func,
    selectMediaURL: PropTypes.func,
  };
  useEffect(retrieveCasts, []);

  const [warning, setWarning] = useState('');
  const retrieveWarning = () => {
    // Some warning logics here
    setWarning('PC users: Audio files will not play in internet explorer');
  };
  useEffect(retrieveWarning, []);
  let warningElement = null;
  if (warning && warning !== '') {
    warningElement = (
      <Alert variant="warning" renderCloseButtonLabel="Close">
        {warning}
      </Alert>
    );
  }

  const [courseIndex, setCourseIndex] = useState(0);
  const handleCourseChange = (event, { index }) => {
    setCourseIndex(index);
  };
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
              selectMediaURL={selectMediaURL}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </View>
  );
};
