import React, { useState } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { TextArea } from '@instructure/ui-text-area';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const AdminPanel = ({
  warning,
  setWarning,
  selectTabIndex,
  lastIndex,
}) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
    selectTabIndex: PropTypes.func,
    lastIndex: PropTypes.number,
  };

  const goBack = () => {
    selectTabIndex(lastIndex);
  };

  const [currWarning, setCurrWarning] = useState(warning);
  const submitEverything = () => {
    const warningToBeSubmitted = dompurify.sanitize(currWarning);
    // Submit to backend here
    setWarning(warningToBeSubmitted);
    goBack();
  };

  return (
    <View>
      <View>
        <Text weight="bold">Bruincast notice</Text>
        <ReactQuill
          theme="snow"
          value={currWarning}
          onChange={setCurrWarning}
        />
      </View>
      <View margin="small">
        <TextArea label="Bruincast crosslists" />
      </View>
      <View display="block" padding="auto" textAlign="center">
        <Button color="primary" onClick={submitEverything} margin="small">
          Submit
        </Button>
        <Button onClick={goBack} margin="small">
          Cancel
        </Button>
      </View>
    </View>
  );
};
