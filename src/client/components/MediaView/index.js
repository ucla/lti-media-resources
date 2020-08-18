import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { IconArrowOpenStartLine } from '@instructure/ui-icons';

import { MediaPlayer } from './MediaPlayer';

export const MediaView = ({
  media,
  userid,
  tab,
  hotReloadPlayback,
  deSelectMedia,
  setError,
}) => {
  MediaView.propTypes = {
    media: PropTypes.object,
    userid: PropTypes.number,
    tab: PropTypes.number,
    hotReloadPlayback: PropTypes.func,
    deSelectMedia: PropTypes.func,
    setError: PropTypes.func,
  };

  return (
    <View>
      <Button
        onClick={deSelectMedia}
        color="primary"
        renderIcon={IconArrowOpenStartLine}
      >
        Back
      </Button>
      <br />
      <br />
      <MediaPlayer
        media={media}
        userid={userid}
        tab={tab}
        hotReloadPlayback={hotReloadPlayback}
        setError={setError}
      />
    </View>
  );
};
