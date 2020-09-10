import React from 'react';
import PropTypes from 'prop-types';

import { BruincastTableWeekToggle } from './BruincastTableWeekToggle';
import { Analytics } from '../Analytics';

export const BruincastTable = ({
  casts,
  selectMedia,
  course,
  shortname,
  analytics,
  showingAnalytics,
  showAnalytics,
  setError,
}) => {
  BruincastTable.propTypes = {
    casts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
    analytics: PropTypes.array,
    showingAnalytics: PropTypes.bool,
    showAnalytics: PropTypes.func,
    setError: PropTypes.func,
  };

  // If analytics is undefined or null (when user doesn't have permission to see analytics)
  if (!analytics) {
    return casts.map(weekCasts => (
      <BruincastTableWeekToggle
        id={`toggleWeek${weekCasts._id}`}
        key={`${shortname}_week${weekCasts._id}`}
        weekNum={weekCasts._id}
        weekCasts={weekCasts.listings}
        selectMedia={selectMedia}
        course={course}
        shortname={shortname}
        setError={setError}
      />
    ));
  }

  // If the user wants to see analytics
  if (showingAnalytics) {
    return (
      <Analytics
        analytics={analytics}
        showing={showingAnalytics}
        show={showAnalytics}
      />
    );
  }

  // If the user is permitted to see analytics but is looking at bruincast medias instead
  return (
    <>
      <Analytics showing={showingAnalytics} show={showAnalytics} />
      {casts.map(weekCasts => (
        <BruincastTableWeekToggle
          id={`toggleWeek${weekCasts._id}`}
          key={`${shortname}_week${weekCasts._id}`}
          weekNum={weekCasts._id}
          weekCasts={weekCasts.listings}
          selectMedia={selectMedia}
          course={course}
          shortname={shortname}
          setError={setError}
        />
      ))}
    </>
  );
};
