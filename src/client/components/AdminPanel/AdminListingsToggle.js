import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';

import { BruincastListingsTable } from './BruincastListingsTable';
import { VideoResListingsTable } from './VideoResListingsTable';
import { MusicResListingsAlbumToggle } from './MusicResListingsAlbumToggle';

const constants = require('../../../../constants');

export const AdminListingsToggle = ({ shortname, listings, mediaType }) => {
  AdminListingsToggle.propTypes = {
    shortname: PropTypes.string,
    listings: PropTypes.array,
    mediaType: PropTypes.number,
  };

  let TableType = null;
  switch (mediaType) {
    case constants.MEDIA_TYPE.BRUINCAST:
      TableType = BruincastListingsTable;
      break;
    case constants.MEDIA_TYPE.VIDEO_RESERVES:
      TableType = VideoResListingsTable;
      break;
    default:
      TableType = null;
      break;
  }

  // If media type is Digital Audio Reserves, return a subtoggle for each album
  if (mediaType === constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES) {
    return (
      <ToggleDetails
        id={shortname}
        summary={`${shortname} · ${listings.length} listing${
          listings.length !== 1 ? 's' : ''
        }`}
        variant="filled"
      >
        {listings.map(listing => (
          <MusicResListingsAlbumToggle
            title={listing.title}
            items={listing.items}
            term={listing.term}
            classID={listing.srs}
          />
        ))}
      </ToggleDetails>
    );
  }

  // If media type is Bruincast or Video Reserves, return a listings table
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
