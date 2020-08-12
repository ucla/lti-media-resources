import React from 'react';
import PropTypes from 'prop-types';

import { CondensedButton } from '@instructure/ui-buttons';
import { Table } from '@instructure/ui-table';

import { PlayButtonGroup } from '../PlayButtonGroup';
import * as constants from '../../constants';

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
          <Table.ColHeader id="actions">Actions</Table.ColHeader>
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
            <Table.Cell>
              <PlayButtonGroup
                video={album.isVideo ? track.httpURL : ''}
                audio={album.isVideo ? '' : track.httpURL}
                selectMedia={handleClick}
                course={{ classShortname: album.classShortname }}
                tab={constants.TAB_DIGITAL_AUDIO_RESERVES}
                eventMediaTitle={{ target: { innerText: track.trackTitle } }}
                playbackMap={
                  track.playback && track.playback !== 0
                    ? new Map([[track.httpURL, track.playback]])
                    : null
                }
              />
            </Table.Cell>
            <Table.Cell>{album.title}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
