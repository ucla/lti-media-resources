import React from 'react';
import PropTypes from 'prop-types';

import { CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';
import { View } from '@instructure/ui-view';
import { Tag } from '@instructure/ui-tag';

import { PlayButtonGroup } from '../PlayButtonGroup';

const constants = require('../../../../constants');

export const TrackTable = ({ album, handleClick, setError }) => {
  TrackTable.propTypes = {
    album: PropTypes.object,
    handleClick: PropTypes.func,
    setError: PropTypes.func,
  };

  return (
    <Table caption="Tracks" hover>
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="title">Track title</Table.ColHeader>
          <Table.ColHeader id="actions" width="260px">
            Play
          </Table.ColHeader>
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
              {track.finished && (
                <View>
                  <br />
                  <Tag text="Watched" />
                </View>
              )}
            </Table.RowHeader>
            <Table.Cell>
              <PlayButtonGroup
                video={album.isVideo ? track.httpURL : ''}
                audio={album.isVideo ? '' : track.httpURL}
                selectMedia={handleClick}
                course={{ classShortname: album.classShortname }}
                mediaType={constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES}
                eventMediaTitle={{ target: { innerText: track.trackTitle } }}
                playbackMap={
                  track.playback
                    ? new Map([[track.httpURL, track.playback]])
                    : null
                }
                remainingMap={
                  track.remaining
                    ? new Map([[track.httpURL, track.remaining]])
                    : null
                }
                finishedMap={
                  track.finished
                    ? new Map([[track.httpURL, track.finished]])
                    : null
                }
                setError={setError}
              />
            </Table.Cell>
            <Table.Cell>{album.title}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
