import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@instructure/ui-buttons';
import { IconArrowOpenStartLine } from '@instructure/ui-icons';

import { MediaPlayer } from './MediaPlayer';

export const MediaView = ({
  media,
  userid,
  mediaType,
  hotReloadPlayback,
  deSelectMedia,
  setError,
}) => {
  MediaView.propTypes = {
    media: PropTypes.object,
    userid: PropTypes.number,
    mediaType: PropTypes.number,
    hotReloadPlayback: PropTypes.func,
    deSelectMedia: PropTypes.func,
    setError: PropTypes.func,
  };

  return (
    <>
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
        mediaType={mediaType}
        hotReloadPlayback={hotReloadPlayback}
        setError={setError}
      />
    </>
  );
};
