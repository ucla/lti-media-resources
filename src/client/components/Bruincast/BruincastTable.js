import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { BruincastTableWeekToggle } from './BruincastTableWeekToggle';
import { Analytics } from '../Analytics';

export const BruincastTable = ({
  casts,
  selectMedia,
  course,
  shortname,
  analytics,
  allUsers,
  userIsInstructor,
  setError,
}) => {
  BruincastTable.propTypes = {
    casts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
    analytics: PropTypes.object,
    allUsers: PropTypes.array,
    userIsInstructor: PropTypes.func,
    setError: PropTypes.func,
  };

  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const showAnalytics = () => {
    if (userIsInstructor()) {
      setShowingAnalytics(!showingAnalytics);
    }
  };

  if (!analytics || !allUsers || !analytics.analytics || !analytics.allTitles) {
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
        <Button onClick={showAnalytics} margin="medium 0" color="primary">
          Back
        </Button>
        <Analytics
          analytics={analytics.analytics}
          allUsers={allUsers}
          allTitles={analytics.allTitles}
        />
      </View>
    );
  }

  return (
    <View>
      <Button onClick={showAnalytics} margin="medium 0" color="primary">
        Analytics
      </Button>
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
