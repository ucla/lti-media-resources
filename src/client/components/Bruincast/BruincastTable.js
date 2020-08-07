import React from 'react';
import PropTypes from 'prop-types';

import { BruincastTableWeekToggle } from './BruincastTableWeekToggle';

export const BruincastTable = ({ casts, selectMedia, course, shortname }) => {
  BruincastTable.propTypes = {
    casts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
  };

  return casts.map(weekCasts => (
    <BruincastTableWeekToggle
      id={`toggleWeek${weekCasts._id}`}
      key={`${shortname}_week${weekCasts._id}`}
      weekNum={weekCasts._id}
      weekCasts={weekCasts.listings}
      selectMedia={selectMedia}
      course={course}
      shortname={shortname}
    />
  ));
};
