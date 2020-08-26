import React from 'react';
import PropTypes from 'prop-types';

import { BruincastAnalyticsWeekToggle } from './BruincastAnalyticsWeekToggle';

export const BruincastAnalyticsCourseTab = ({ casts, allUsers }) => {
  BruincastAnalyticsCourseTab.propTypes = {
    casts: PropTypes.array,
    allUsers: PropTypes.array,
  };

  return casts.map(weekCasts => (
    <BruincastAnalyticsWeekToggle
      id={`toggleWeek${weekCasts._id}`}
      key={`toggleWeek${weekCasts._id}`}
      weekNum={weekCasts._id}
      weekCasts={weekCasts.listings}
      allUsers={allUsers}
    />
  ));
};
