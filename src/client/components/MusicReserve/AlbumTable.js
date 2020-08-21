import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button, CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';
import { Tag } from '@instructure/ui-tag';
import { IconCollectionSolid } from '@instructure/ui-icons';

import { PlayButtonGroup } from '../PlayButtonGroup';

const constants = require('../../../../constants');

export const AlbumTable = ({ allAlbums, handleClick, setError }) => {
  AlbumTable.propTypes = {
    allAlbums: PropTypes.array,
    handleClick: PropTypes.func,
    setError: PropTypes.func,
  };

  return (
    <Table caption="Albums" hover>
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="title">Title</Table.ColHeader>
          <Table.ColHeader id="count"># of tracks</Table.ColHeader>
          <Table.ColHeader id="actions" width="260px">
            Actions
          </Table.ColHeader>
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
              {album.items.length === 1 && album.items[0].finished && (
                <View>
                  <br />
                  <Tag text="Watched" />
                </View>
              )}
            </Table.RowHeader>
            <Table.Cell>{album.items.length}</Table.Cell>
            <Table.Cell>
              {album.items.length === 1 && (
                <PlayButtonGroup
                  video={album.isVideo ? album.items[0].httpURL : ''}
                  audio={album.isVideo ? '' : album.items[0].httpURL}
                  selectMedia={handleClick}
                  course={{ classShortname: album.classShortname }}
                  mediaType={constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES}
                  eventMediaTitle={{ target: { innerText: album.title } }}
                  playbackMap={
                    album.items[0].playback
                      ? new Map([
                          [album.items[0].httpURL, album.items[0].playback],
                        ])
                      : null
                  }
                  remainingMap={
                    album.items[0].remaining
                      ? new Map([
                          [album.items[0].httpURL, album.items[0].remaining],
                        ])
                      : null
                  }
                  finishedMap={
                    album.items[0].finished
                      ? new Map([
                          [album.items[0].httpURL, album.items[0].finished],
                        ])
                      : null
                  }
                  setError={setError}
                />
              )}
              {album.items.length !== 1 && (
                <Button
                  renderIcon={<IconCollectionSolid />}
                  color="primary"
                  margin="xxx-small"
                  size="medium"
                  textAlign="start"
                  onClick={() => {
                    handleClick({ target: { innerText: album.title } });
                  }}
                >
                  Tracks
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
