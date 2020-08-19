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

  // If media type is Bruincast or Video Reserves, display a listings table
  // If media type is Digital Audio Reserves, display a toggle for each album
  return (
    <ToggleDetails
      id={shortname}
      summary={`${shortname} · ${listings.length} listing${
        listings.length !== 1 ? 's' : ''
      }`}
      variant="filled"
    >
      {mediaType === constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES &&
        listings.map(listing => (
          <MusicResListingsAlbumToggle key={listing._id} album={listing} />
        ))}
      {mediaType !== constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES && (
        <TableType shortname={shortname} listings={listings} />
      )}
    </ToggleDetails>
  );
};
