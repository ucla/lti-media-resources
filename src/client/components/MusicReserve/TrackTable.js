import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';

export const TrackTable = ({ album, handleClick, goBack }) => {
  TrackTable.propTypes = {
    album: PropTypes.object,
    handleClick: PropTypes.func,
    goBack: PropTypes.func,
  };

  return (
    <View>
      <CondensedButton onClick={goBack} display="block" margin="medium">
        {'< Back'}
      </CondensedButton>
      <Table caption="Albums">
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="title">Track title</Table.ColHeader>
            <Table.ColHeader id="album">Album</Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {album.items.map(track => (
            <Table.Row>
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
    </View>
  );
};
