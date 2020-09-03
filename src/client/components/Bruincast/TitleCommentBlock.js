import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

import { Comment } from '../Comment';

export const TitleCommentBlock = ({ title, comments }) => {
  TitleCommentBlock.propTypes = {
    title: PropTypes.string.isRequired,
    comments: PropTypes.string,
  };

  if (
    !comments ||
    comments === '' ||
    comments === '<p></p>' ||
    comments === '<p><br></p>'
  ) {
    return (
      <View display="block">
        <strong>Title: </strong>
        {title}
      </View>
    );
  }
  return (
    <>
      <div>
        <strong>Title: </strong>
        {title}
      </div>
      <span>
        <strong>Comments: </strong>
        <Comment commentText={comments} />
      </span>
    </>
  );
};
