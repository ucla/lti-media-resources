import React, { useState, useEffect } from 'react';
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
  crosslist,
}) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
    selectTabIndex: PropTypes.func,
    lastIndex: PropTypes.number,
    crosslist: PropTypes.array,
  };

  const goBack = () => {
    selectTabIndex(lastIndex);
  };

  // Controlled state of 'Bruincast notice' input
  const [currWarning, setCurrWarning] = useState(warning);

  // Controlled state of 'Bruincast crosslists' input
  const [currCrosslist, setCurrCrosslist] = useState('');
  const initializeCrosslist = () => {
    let clStr = '';
    for (const course of crosslist) {
      clStr = `${clStr}\n${course.label}`;
    }
    clStr = clStr.substr(1, clStr.length);
    setCurrCrosslist(clStr);
  };
  useEffect(initializeCrosslist, []);

  const handleCrosslistChange = e => {
    setCurrCrosslist(e.target.value);
  };

  // Submit logic
  const submitEverything = () => {
    const warningToBeSubmitted = dompurify.sanitize(currWarning);
    // Submit to backend here
    setWarning(warningToBeSubmitted);
    goBack();
  };

  // JSX
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
        <TextArea
          label="Bruincast crosslists"
          value={currCrosslist}
          onChange={handleCrosslistChange}
        />
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
