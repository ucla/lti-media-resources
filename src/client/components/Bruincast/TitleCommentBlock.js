import React from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';

export const TitleCommentBlock = ({ title, comments }) => {
  TitleCommentBlock.propTypes = {
    title: PropTypes.string.isRequired,
    comments: PropTypes.array,
  };
  if (!comments || comments.length === 0 || comments[0] === '') {
    return (
      <View display="block">
        <strong>Title: </strong>
        {title}
      </View>
    );
  }
  return (
    <View display="block">
      <View display="block">
        <strong>Title: </strong>
        {title}
      </View>
      <Text>
        <strong>Comments: </strong>
        {comments[0]}
      </Text>
      {comments
        .filter((comment, index) => index !== 0)
        .map(comment => (
          <View>
            <br />
            <Text>{comment}</Text>
          </View>
        ))}
    </View>
  );
};
