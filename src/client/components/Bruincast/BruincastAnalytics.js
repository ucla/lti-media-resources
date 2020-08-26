import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Tabs } from '@instructure/ui-tabs';
import { BruincastAnalyticsCourseTab } from './BruincastAnalyticsCourseTab';

export const BruincastAnalytics = ({ castsByCourses, allUsers }) => {
  BruincastAnalytics.propTypes = {
    castsByCourses: PropTypes.array,
    allUsers: PropTypes.array,
  };

  const [tabSelectedIndex, selectTabIndex] = useState(0);
  const handleTabChange = (event, { index }) => {
    selectTabIndex(index);
  };

  return (
    <Tabs onRequestTabChange={handleTabChange}>
      {castsByCourses.map((currCourse, i) => (
        <Tabs.Panel
          id={currCourse.course.label}
          key={currCourse.course.label}
          renderTitle={currCourse.course.label}
          isSelected={tabSelectedIndex === i}
        >
          <BruincastAnalyticsCourseTab
            casts={currCourse.casts}
            allUsers={allUsers}
          />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};
