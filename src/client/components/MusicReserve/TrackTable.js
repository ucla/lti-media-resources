import React from 'react';
import PropTypes from 'prop-types';

import { CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';

export const TrackTable = ({ album, handleClick }) => {
  TrackTable.propTypes = {
    album: PropTypes.object,
    handleClick: PropTypes.func,
  };

  return (
    <Table caption="Tracks">
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="title">Track title</Table.ColHeader>
          <Table.ColHeader id="album">Album</Table.ColHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {album.items.map(track => (
          <Table.Row
            key={`${track.volume}-${track.disc}-${track.side}-${track.trackNumber}`}
          >
            <Table.RowHeader>
              <CondensedButton onClick={handleClick}>
                {track.trackTitle}
              </CondensedButton>
            </Table.RowHeader>
            <Table.Cell>{album.title}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
