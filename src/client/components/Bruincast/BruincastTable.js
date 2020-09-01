import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { BruincastTableWeekToggle } from './BruincastTableWeekToggle';
import { Analytics } from '../Analytics';

export const BruincastTable = ({
  casts,
  selectMedia,
  course,
  shortname,
  analytics,
  setError,
}) => {
  BruincastTable.propTypes = {
    casts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
    analytics: PropTypes.array,
    setError: PropTypes.func,
  };

  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const showAnalytics = () => {
    setShowingAnalytics(!showingAnalytics);
  };

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

  if (showingAnalytics) {
    return (
      <View>
        <Analytics
          analytics={analytics}
          showing={showingAnalytics}
          show={showAnalytics}
        />
      </View>
    );
  }

  return (
    <View>
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
    </View>
  );
};
