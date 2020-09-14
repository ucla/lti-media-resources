import React from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { Text } from '@instructure/ui-text';

const sanitizeComment = (comment) =>
  dompurify
    .sanitize(comment)
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/ ... /g, '\n')
    .replace(/&nbsp;/g, ' ');

export const Comment = ({ commentText }) => {
  Comment.propTypes = {
    commentText: PropTypes.string,
  };

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      <Text wrap="break-word">{sanitizeComment(commentText)}</Text>
    </span>
  );
};
