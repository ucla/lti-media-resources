import React, { useState, useEffect } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';

export const TitleCommentBlock = ({ title, comments }) => {
  TitleCommentBlock.propTypes = {
    title: PropTypes.string.isRequired,
    comments: PropTypes.string,
  };

  const [sanitizedComments, setSanitizedComments] = useState('');
  const sanitizeComments = () => {
    const inlineComments = dompurify
      .sanitize(comments)
      .replace(/<p>/g, '<span>')
      .replace(/<\/p>/g, '</span>')
      .replace(/ ... /g, '</span><br><span>');
    setSanitizedComments(`<strong>Comments: </strong>${inlineComments}`);
  };
  useEffect(sanitizeComments, []);

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
    <div>
      <div>
        <strong>Title: </strong>
        {title}
      </div>
      <span dangerouslySetInnerHTML={{ __html: sanitizedComments }} />
    </div>
  );
};
