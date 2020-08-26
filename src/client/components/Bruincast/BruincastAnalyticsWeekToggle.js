import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';

import { Analytics } from '../Analytics';

export const BruincastAnalyticsWeekToggle = ({
  weekNum,
  weekCasts,
  allUsers,
}) => {
  BruincastAnalyticsWeekToggle.propTypes = {
    weekNum: PropTypes.number,
    weekCasts: PropTypes.array,
    allUsers: PropTypes.array,
  };

  let toggleSummary = `Week ${weekNum}`;
  if (weekNum === 88) {
    toggleSummary = 'Finals Week';
  }

  return (
    <ToggleDetails
      id={`week${weekNum}`}
      summary={toggleSummary}
      variant="filled"
      defaultExpanded
    >
      <Analytics medias={weekCasts} allUsers={allUsers} />
    </ToggleDetails>
  );
};
