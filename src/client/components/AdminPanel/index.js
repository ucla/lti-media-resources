import React, { useState, useEffect } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { TextArea } from '@instructure/ui-text-area';
import { Tabs } from '@instructure/ui-tabs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

import { BruinCastListings } from './BruinCastListings';
import { ltikPromise } from '../../services/ltik';

export const AdminPanel = ({ warning, setWarning }) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
  };

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const handleTabChange = (event, { index }) => {
    setSelectedTabIndex(index);
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

  const handleCrosslistChange = e => {
    setCurrCrosslist(e.target.value);
  };

  // Submit logic
  const submitWarning = async () => {
    const warningToBeSubmitted = dompurify.sanitize(currWarning);
    // Submit to backend here
    ltikPromise.then(ltik => {
      axios
        .post(`/api/medias/bruincast/notice?ltik=${ltik}`, {
          notice: warningToBeSubmitted,
        })
        .then(() => {
          setWarning(warningToBeSubmitted);
          return warningToBeSubmitted;
        });
    });
  };

  const submitCrosslist = async () => {
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
    // Post to back-end here
    return listOfArr;
  };

  const submitEverything = async () => {
    try {
      await submitWarning();
      await submitCrosslist();
      alert('Submission successful!');
    } catch (e) {
      alert('Something went wrong...');
    }
  };

  // JSX
  return (
    <View>
      <Tabs variant="secondary" onRequestTabChange={handleTabChange}>
        <Tabs.Panel
          renderTitle="BruinCast Settings"
          isSelected={selectedTabIndex === 0}
        >
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
        </Tabs.Panel>
        <Tabs.Panel
          renderTitle="BruinCast Listings"
          isSelected={selectedTabIndex === 1}
        >
          <BruinCastListings />
        </Tabs.Panel>
      </Tabs>
    </View>
  );
};
