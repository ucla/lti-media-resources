import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { IconArrowOpenStartLine } from '@instructure/ui-icons';

import { MediaPlayer } from '../MediaPlayer';

export const MediaView = ({ mediaURL, mediaFormat, deSelectMedia }) => {
  MediaView.propTypes = {
    mediaURL: PropTypes.string,
    mediaFormat: PropTypes.string,
    deSelectMedia: PropTypes.func,
  };

  return (
    <View>
      <Button onClick={deSelectMedia} renderIcon={IconArrowOpenStartLine}>
        Back
      </Button>
      <br />
      <br />
      <MediaPlayer mediaURL={mediaURL} format={mediaFormat} />
    </View>
  );
};
