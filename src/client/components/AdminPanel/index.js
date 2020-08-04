import React, { useState, useEffect } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { TextArea } from '@instructure/ui-text-area';
import { Alert } from '@instructure/ui-alerts';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

import { ltikPromise } from '../../services/ltik';

export const AdminPanel = ({ warning, setWarning, retrieveNums }) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
    retrieveNums: PropTypes.func,
  };

  // Controlled state of 'Bruincast notice' input
  const [currWarning, setCurrWarning] = useState(warning);

  // Controlled state of 'Bruincast crosslists' input
  const [currCrosslist, setCurrCrosslist] = useState('');

  const retrieveAllCrosslists = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/medias/bruincast/crosslists?ltik=${ltik}`).then(res => {
        const lists = res.data;
        let crosslistStr = '';
        for (const list of lists) {
          for (const label of list) {
            crosslistStr += `${label}=`;
          }
          crosslistStr = `${crosslistStr.substr(0, crosslistStr.length - 1)}\n`;
        }
        crosslistStr = crosslistStr.substr(0, crosslistStr.length - 1);
        setCurrCrosslist(crosslistStr);
      });
    });
  };
  useEffect(retrieveAllCrosslists, []);

  const [crosslistChanged, setCrosslistChanged] = useState(false);
  const handleCrosslistChange = e => {
    setCurrCrosslist(e.target.value);
    setCrosslistChanged(true);
  };

  const [alert, setAlert] = useState(null);

  // Submit logic
  const submitWarning = async () => {
    const warningToBeSubmitted = dompurify.sanitize(currWarning);
    if (warningToBeSubmitted !== warning) {
      const ltik = await ltikPromise;
      await axios.post(`/api/medias/bruincast/notice?ltik=${ltik}`, {
        notice: warningToBeSubmitted,
      });
      setWarning(warningToBeSubmitted);
      return true;
    }
    return false;
  };

  const submitCrosslist = async () => {
    if (!crosslistChanged) {
      return { insertedCount: 0, deletedCount: 0, updated: false };
    }
    let strToBeSubmitted = currCrosslist;
    if (strToBeSubmitted.charAt(strToBeSubmitted.length - 1) === '\n') {
      strToBeSubmitted = strToBeSubmitted.substr(
        0,
        strToBeSubmitted.length - 1
      );
    }
    const listOfStrs = strToBeSubmitted.split('\n');
    const listOfArr = [];
    for (let str of listOfStrs) {
      if (str.charAt(str.length - 1) === '=') {
        str = str.substr(0, str.length - 1);
      }
      const arr = str.split('=');
      listOfArr.push(arr);
    }
    const ltik = await ltikPromise;
    const res = await axios.post(
      `/api/medias/bruincast/crosslists?ltik=${ltik}`,
      {
        crosslists: listOfArr,
      }
    );
    setCrosslistChanged(false);
    retrieveNums();
    return res.data;
  };

  const submitEverything = async () => {
    try {
      const noticeUpdateStatus = await submitWarning();
      const { insertedCount, deletedCount, updated } = await submitCrosslist();
      const noticeUpdatedStr = noticeUpdateStatus
        ? 'Notice updated.'
        : 'Notice unchanged.';
      const listUpdatedStr = updated
        ? `Crosslists updated with ${deletedCount} deletions then ${insertedCount} insertions.`
        : 'Crosslists unchanged.';
      setAlert(
        <Alert variant="success">
          <p>{noticeUpdatedStr}</p>
          <p>{listUpdatedStr}</p>
        </Alert>
      );
    } catch (e) {
      setAlert(<Alert variant="error">Something went wrong...</Alert>);
    }
  };

  // JSX
  return (
    <View>
      {alert}
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
      </View>
    </View>
  );
};
