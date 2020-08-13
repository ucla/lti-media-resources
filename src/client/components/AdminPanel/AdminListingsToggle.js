import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';

import { BruincastListingsTable } from './BruincastListingsTable';
import { VideoResListingsTable } from './VideoResListingsTable';

export const AdminListingsToggle = ({ shortname, listings, contentType }) => {
  AdminListingsToggle.propTypes = {
    shortname: PropTypes.string,
    listings: PropTypes.array,
    contentType: PropTypes.string,
  };

  let TableType = null;
  switch (contentType) {
    case 'bruincast':
      TableType = BruincastListingsTable;
      break;
    case 'videores':
      TableType = VideoResListingsTable;
      break;
    default:
      TableType = null;
      break;
  }

  return (
    <ToggleDetails
      id={shortname}
      summary={`${shortname} · ${listings.length} listing${
        listings.length !== 1 ? 's' : ''
      }`}
      variant="filled"
    >
      <TableType shortname={shortname} listings={listings} />
    </ToggleDetails>
  );
};
