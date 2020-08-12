import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button, CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { PlayButtonGroup } from '../PlayButtonGroup';

import * as constants from '../../constants';

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
          <Table.ColHeader id="actions">Actions</Table.ColHeader>
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
              {album.items.length === 1 && (
                <PlayButtonGroup
                  video={album.isVideo ? album.items[0].httpURL : ''}
                  audio={album.isVideo ? '' : album.items[0].httpURL}
                  selectMedia={handleClick}
                  course={{ classShortname: album.classShortname }}
                  tab={constants.TAB_DIGITAL_AUDIO_RESERVES}
                  eventMediaTitle={{ target: { innerText: album.title } }}
                  playbackMap={
                    album.items[0].playback && album.items[0].playback !== 0
                      ? new Map([
                          [album.items[0].httpURL, album.items[0].playback],
                        ])
                      : null
                  }
                />
              )}
              {album.items.length !== 1 && (
                <Button
                  renderIcon={<FontAwesomeIcon icon={faBars} />}
                  color="primary"
                  margin="xxx-small"
                  size="medium"
                  onClick={() => {
                    handleClick({ target: { innerText: album.title } });
                  }}
                >
                  View
                </Button>
              )}
            </Table.Cell>
            <Table.Cell>
              {album.performers !== '' && (
                <Text>
                  <strong>Performers:</strong> {album.performers}
                </Text>
              )}
              {album.notes && album.notes !== '' && (
                <View>
                  <br />
                  <Text>
                    <strong>Notes:</strong> {album.notes}
                  </Text>
                </View>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
