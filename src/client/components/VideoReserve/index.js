import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Table } from '@instructure/ui-table';
import { Tag } from '@instructure/ui-tag';

import { ltikPromise } from '../../services/ltik';
import { PlayButton } from '../PlayButtonGroup/PlayButton';
import { MediaView } from '../MediaView';

const constants = require('../../../../constants');

export const VideoReserve = ({ course, onCampus, userid }) => {
  VideoReserve.propTypes = {
    course: PropTypes.object,
    onCampus: PropTypes.bool,
    userid: PropTypes.number,
  };

  const [vidReserves, setVidReserves] = React.useState([]);
  const getVideoRes = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/medias/videores?ltik=${ltik}`).then(res => {
        setVidReserves(res.data);
      });
    });
  };
  React.useEffect(getVideoRes, []);

  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = obj => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  const hotReloadPlayback = (file, playback, remaining, finished) => {
    const toBeSet = vidReserves;
    const itemToBeSet = toBeSet.filter(media => media.filename === file)[0];
    itemToBeSet.playback = playback;
    itemToBeSet.remaining = remaining;
    if (finished) {
      if (itemToBeSet.finished) {
        itemToBeSet.finished += 1;
      } else {
        itemToBeSet.finished = 1;
      }
    }
    // Change state to trigger component reload
    setVidReserves([]);
    setVidReserves(toBeSet);
  };

  // If playing media
  if (
    selectedMedia.url &&
    selectedMedia.url !== '' &&
    selectedMedia.format &&
    selectedMedia.format !== ''
  ) {
    return (
      <MediaView
        media={selectedMedia}
        userid={userid}
        tab={constants.TABS.VIDEO_RESERVES}
        deSelectMedia={deselectMedia}
        hotReloadPlayback={hotReloadPlayback}
      />
    );
  }

  // If not playing media
  return (
    <View>
      <Heading>{`Video reserves: ${course.title}`}</Heading>
      <br />
      {!onCampus && (
        <Alert variant="warning">
          You are accessing this content from off-campus. If the content does
          not load, you will need to use the UCLA VPN to access it via an
          on-campus internet address.
          <br />
          <br />
          VPN instructions:{' '}
          <a
            href="https://www.it.ucla.edu/it-support-center/services/virtual-private-network-vpn-clients"
            target="_blank"
            rel="noreferrer"
          >
            it.ucla.edu/it-support-center/services/virtual-private-network-vpn-clients
          </a>
        </Alert>
      )}
      <Table hover id="videoreserves" caption="Video Reserves">
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="title">Title</Table.ColHeader>
            <Table.ColHeader id="play" width="260px">
              Play
            </Table.ColHeader>
            <Table.ColHeader id="availability">Availability</Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {vidReserves.map(vid => (
            <Table.Row key={vid.videoTitle}>
              <Table.RowHeader>
                {vid.videoTitle}
                {vid.finished && (
                  <View>
                    <br />
                    <Tag text="Watched" />
                  </View>
                )}
              </Table.RowHeader>
              <Table.Cell>
                <PlayButton
                  format="video"
                  src={vid.filename}
                  selectMedia={selectMedia}
                  file={vid.filename}
                  course={course}
                  tab={constants.TABS.VIDEO_RESERVES}
                  playback={vid.playback}
                  remaining={vid.remaining}
                  finished={vid.finished}
                  disabled={vid.expired}
                />
              </Table.Cell>
              <Table.Cell>{`${vid.startDate} – ${vid.stopDate}`}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </View>
  );
};
