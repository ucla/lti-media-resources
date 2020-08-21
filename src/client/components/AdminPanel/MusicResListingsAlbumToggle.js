import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Table } from '@instructure/ui-table';
import { Text } from '@instructure/ui-text';
import { Pill } from '@instructure/ui-pill';

import { MusicResListingsTable } from './MusicResListingsTable';

export const MusicResListingsAlbumToggle = ({ album }) => {
  MusicResListingsAlbumToggle.propTypes = {
    album: PropTypes.object,
  };

  // Summary includes album title and number of tracks
  // If blank SRS, include orange warning pill
  // Some blank SRS numbers include multiple spaces, so trim the spaces
  const albumTitleSummary = (
    <>
      <Text>
        {`${album.title} · ${album.items.length} track${
          album.items.length !== 1 ? 's' : ''
        }`}
      </Text>{' '}
      {album.srs.trim() === '' && (
        <Pill color="warning" margin="none">
          Missing Class ID
        </Pill>
      )}
    </>
  );

  return (
    <ToggleDetails
      id={album.title}
      summary={albumTitleSummary}
      variant="filled"
    >
      <ToggleDetails
        id={`details_${album.title}`}
        summary="Album Details"
        variant="filled"
      >
        <Table
          id={`details_${album.title}`}
          hover
          caption={`Album Details: ${album.title}`}
        >
          <Table.Body>
            <Table.Row>
              <Table.RowHeader>Album Title</Table.RowHeader>
              <Table.Cell>{album.title}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Performers</Table.RowHeader>
              <Table.Cell>{album.performers}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Note 1</Table.RowHeader>
              <Table.Cell>{album.noteOne}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Note 2</Table.RowHeader>
              <Table.Cell>{album.noteTwo}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Label</Table.RowHeader>
              <Table.Cell>{album.label}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Label Catalog #</Table.RowHeader>
              <Table.Cell>{album.labelCatalogNumber}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.RowHeader>Call Number</Table.RowHeader>
              <Table.Cell>{album.callNumber}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </ToggleDetails>
      <MusicResListingsTable
        items={album.items}
        term={album.term}
        classID={album.srs}
        albumTitle={album.title}
      />
    </ToggleDetails>
  );
};
