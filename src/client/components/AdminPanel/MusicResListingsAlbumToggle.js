import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';

import { MusicResListingsTable } from './MusicResListingsTable';

export const MusicResListingsAlbumToggle = ({
  title,
  items,
  term,
  classID,
}) => {
  MusicResListingsAlbumToggle.propTypes = {
    title: PropTypes.string,
    items: PropTypes.array,
    term: PropTypes.string,
    classID: PropTypes.string,
  };

  return (
    <ToggleDetails
      id={title}
      summary={`${title} · ${items.length} track${
        items.length !== 1 ? 's' : ''
      }`}
      variant="filled"
    >
      <MusicResListingsTable
        items={items}
        term={term}
        classID={classID}
        albumTitle={title}
      />
    </ToggleDetails>
  );
};
