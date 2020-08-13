import React, { useState, useEffect } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { TextArea } from '@instructure/ui-text-area';
import { Tabs } from '@instructure/ui-tabs';
import { Alert } from '@instructure/ui-alerts';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

import { AdminListings } from './AdminListings';
import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

export const AdminPanel = ({ warning, setWarning, retrieveNums }) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
    retrieveNums: PropTypes.func,
  };

  // Tab change logic
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    constants.TAB_ADMIN_PANEL_SETTINGS
  );
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
      <Tabs variant="secondary" onRequestTabChange={handleTabChange}>
        <Tabs.Panel
          id="adminPanelSettings"
          renderTitle="Bruincast Settings"
          isSelected={selectedTabIndex === constants.TAB_ADMIN_PANEL_SETTINGS}
        >
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
        </Tabs.Panel>
        <Tabs.Panel
          id="adminPanelListingsBruincast"
          renderTitle="Bruincast Listings"
          isSelected={
            selectedTabIndex === constants.TAB_ADMIN_PANEL_LISTINGS_BRUINCAST
          }
        >
          <AdminListings contentType="bruincast" />
        </Tabs.Panel>
        <Tabs.Panel
          id="adminPanelListingsVideoReserves"
          renderTitle="Video Reserves Listings"
          isSelected={
            selectedTabIndex ===
            constants.TAB_ADMIN_PANEL_LISTINGS_VIDEORESERVES
          }
        >
          <AdminListings contentType="videores" />
        </Tabs.Panel>
      </Tabs>
    </View>
  );
};
