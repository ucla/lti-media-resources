import React, { useState, useEffect } from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { TextArea } from '@instructure/ui-text-area';
import { Tabs } from '@instructure/ui-tabs';
import { Alert } from '@instructure/ui-alerts';

import { AdminListings } from './AdminListings';
import { getLtik } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export const AdminPanel = ({ warning, setWarning, retrieveNums, setError }) => {
  AdminPanel.propTypes = {
    warning: PropTypes.string,
    setWarning: PropTypes.func,
    retrieveNums: PropTypes.func,
    setError: PropTypes.func,
  };

  // Tab change logic
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    constants.ADMIN_PANEL_TABS.SETTINGS
  );
  const handleTabChange = (event, { index }) => {
    setSelectedTabIndex(index);
  };

  // Controlled state of 'Bruincast notice' input
  const [currWarning, setCurrWarning] = useState(warning);

  // Controlled state of 'Bruincast crosslists' input
  const [currCrosslist, setCurrCrosslist] = useState('');

  // Retrieve all crosslists from back-end
  const retrieveAllCrosslists = () => {
    const ltik = getLtik();
    axios
      .get(
        `${process.env.LTI_APPROUTE}/api/medias/bruincast/crosslists?ltik=${ltik}`
      )
      .then((res) => {
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
        setError(null);
      })
      .catch((err) => {
        setError({
          err,
          msg: 'Something went wrong when retrieving all crosslists...',
        });
      });
  };
  // Loads all crosslists (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveAllCrosslists, []);

  // Declare a boolean to indicate whether the text input for crosslist is ever changed or not.
  // If crosslist is never changed, we can save the costly http request of updating crosslists.
  const [crosslistChanged, setCrosslistChanged] = useState(false);
  const handleCrosslistChange = (e) => {
    setCurrCrosslist(e.target.value);
    setCrosslistChanged(true);
  };

  // An alert that indicate submission status (success of failure)
  const [alert, setAlert] = useState(null);

  // Submit logic
  const submitWarning = async () => {
    const warningToBeSubmitted = dompurify.sanitize(currWarning);
    if (warningToBeSubmitted !== warning) {
      const ltik = getLtik();
      await axios.post(
        `${process.env.LTI_APPROUTE}/api/medias/bruincast/notice?ltik=${ltik}`,
        {
          notice: warningToBeSubmitted,
        }
      );
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
    const ltik = getLtik();
    const res = await axios.post(
      `${process.env.LTI_APPROUTE}/api/medias/bruincast/crosslists?ltik=${ltik}`,
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
    <Tabs variant="secondary" onRequestTabChange={handleTabChange}>
      <Tabs.Panel
        id="adminPanelSettings"
        renderTitle="BruinCast Settings"
        isSelected={selectedTabIndex === constants.ADMIN_PANEL_TABS.SETTINGS}
      >
        {alert}
        <View>
          <Text weight="bold">BruinCast notice</Text>
          <ReactQuill
            theme="snow"
            value={currWarning}
            onChange={setCurrWarning}
          />
        </View>
        <View margin="small none" display="block">
          <TextArea
            label="BruinCast crosslists"
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
        renderTitle={`${
          constants.mediaTypeMap.get(constants.MEDIA_TYPE.BRUINCAST).string
        } Listings`}
        isSelected={
          selectedTabIndex === constants.ADMIN_PANEL_TABS.LISTINGS_BRUINCAST
        }
      >
        <AdminListings
          mediaType={constants.MEDIA_TYPE.BRUINCAST}
          setError={setError}
        />
      </Tabs.Panel>
      <Tabs.Panel
        id="adminPanelListingsVideoReserves"
        renderTitle={`${
          constants.mediaTypeMap.get(constants.MEDIA_TYPE.VIDEO_RESERVES).string
        } Listings`}
        isSelected={
          selectedTabIndex === constants.ADMIN_PANEL_TABS.LISTINGS_VIDEORESERVES
        }
      >
        <AdminListings
          mediaType={constants.MEDIA_TYPE.VIDEO_RESERVES}
          setError={setError}
        />
      </Tabs.Panel>
      <Tabs.Panel
        id="adminPanelListingsMusicReserves"
        renderTitle={`${
          constants.mediaTypeMap.get(
            constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES
          ).string
        } Listings`}
        isSelected={
          selectedTabIndex ===
          constants.ADMIN_PANEL_TABS.LISTINGS_DIGITALAUDIORESERVES
        }
      >
        <AdminListings
          mediaType={constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES}
          setError={setError}
        />
      </Tabs.Panel>
    </Tabs>
  );
};
