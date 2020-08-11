import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Table } from '@instructure/ui-table';
import { Button } from '@instructure/ui-buttons';
import { IconVideoSolid } from '@instructure/ui-icons';

import { ltikPromise } from '../../services/ltik';
import { PlayButton } from '../PlayButtonGroup/PlayButton';
import { MediaView } from '../MediaView';

export const VideoReserve = ({ course, onCampus }) => {
  VideoReserve.propTypes = {
    course: PropTypes.object,
    onCampus: PropTypes.bool,
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

  // If playing media
  if (
    selectedMedia.url &&
    selectedMedia.url !== '' &&
    selectedMedia.format &&
    selectedMedia.format !== ''
  ) {
    return (
      <MediaView
        mediaURL={selectedMedia.url}
        mediaFormat={selectedMedia.format}
        deSelectMedia={deselectMedia}
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
            <Table.ColHeader id="play" width="20%">
              Play
            </Table.ColHeader>
            <Table.ColHeader id="title" width="40%">
              Title
            </Table.ColHeader>
            <Table.ColHeader id="availability" width="40%">
              Availability
            </Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {vidReserves.map(vid => (
            <Table.Row key={vid.videoTitle}>
              <Table.Cell>
                <PlayButton
                  media="videores"
                  format="video"
                  selectMedia={selectMedia}
                  file={vid.filename}
                  course={course}
                  disabled={vid.expired}
                />
              </Table.Cell>
              <Table.Cell>{vid.videoTitle}</Table.Cell>
              <Table.Cell>{`${vid.startDate} – ${vid.stopDate}`}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </View>
  );
};
