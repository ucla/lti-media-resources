import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Text } from '@instructure/ui-text';
import { Pill } from '@instructure/ui-pill';

import { BruincastListingsTable } from './BruincastListingsTable';
import { VideoResListingsTable } from './VideoResListingsTable';
import { MusicResListingsAlbumToggle } from './MusicResListingsAlbumToggle';

const constants = require('../../../../constants');

export const AdminListingsToggle = ({
  shortname,
  term,
  listings,
  mediaType,
}) => {
  AdminListingsToggle.propTypes = {
    shortname: PropTypes.string,
    term: PropTypes.string,
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

  // Summary includes the shortname and the number of listings
  // If missing shortname, include an orange warning pill
  const shortnameSummary = (
    <>
      <Text>
        {`${shortname === null ? `${term}: No Shortname` : shortname} · ${
          listings.length
        } listing${listings.length !== 1 ? 's' : ''}`}
      </Text>{' '}
      {shortname === null && (
        <Pill color="warning" margin="none">
          Missing Shortname
        </Pill>
      )}
    </>
  );

  // If media type is Bruincast or Video Reserves, display a listings table
  // If media type is Digital Audio Reserves, display a toggle for each album
  return (
    <ToggleDetails id={shortname} summary={shortnameSummary} variant="filled">
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
