import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Table } from '@instructure/ui-table';

import { MusicResListingsTable } from './MusicResListingsTable';

export const MusicResListingsAlbumToggle = ({ album }) => {
  MusicResListingsAlbumToggle.propTypes = {
    album: PropTypes.object,
  };

  return (
    <ToggleDetails
      id={album.title}
      summary={`${album.title} · ${album.items.length} track${
        album.items.length !== 1 ? 's' : ''
      }`}
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
