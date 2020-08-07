import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';

export const AlbumTable = ({ allAlbums, handleClick }) => {
  AlbumTable.propTypes = {
    allAlbums: PropTypes.array,
    handleClick: PropTypes.func,
  };

  return (
    <Table caption="Albums">
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="title">Title</Table.ColHeader>
          <Table.ColHeader id="count"># of tracks</Table.ColHeader>
          <Table.ColHeader id="meta">Descriptions</Table.ColHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {allAlbums.map(album => (
          <Table.Row key={album._id}>
            <Table.RowHeader>
              <CondensedButton onClick={handleClick}>
                {album.title}
              </CondensedButton>
            </Table.RowHeader>
            <Table.Cell>{album.items.length}</Table.Cell>
            <Table.Cell>
              {album.performers !== '' && (
                <Text>
                  <strong>Performers:</strong> {album.performers}
                </Text>
              )}
              {album.noteOne !== '' && (
                <View>
                  <br />
                  <Text>
                    <strong>Notes:</strong> {album.noteOne}
                  </Text>
                </View>
              )}
              {album.noteTwo !== '' && (
                <View>
                  <br />
                  <Text>{album.noteOne}</Text>
                </View>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
