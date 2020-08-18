import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import './app.css';
import dompurify from 'dompurify';
import axios from 'axios';

import { Tabs } from '@instructure/ui-tabs';
import { View } from '@instructure/ui-view';

import axiosRetry from 'axios-retry';
import { Bruincast } from '../Bruincast';
import { VideoReserve } from '../VideoReserve';
import { MusicReserve } from '../MusicReserve';
import { AdminPanel } from '../AdminPanel';
import { ErrorAlert } from './ErrorAlert';

import { ltikPromise } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

theme.use();

const App = () => {
  // Logic of changing tabs
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TABS.BRUINCAST);
  const handleTabChange = (event, { index }) => {
    selectTabIndex(index);
  };

  // Declare states
  const [course, setCourse] = useState({});
  const [roles, setRoles] = useState([]);
  const [userid, setUserid] = useState(-1);
  const [onCampusStatus, setOnCampusStatus] = useState(true);
  const [bruincastCount, setBruincastCount] = useState(0);
  const [videoReserveCount, setVideoReserveCount] = useState(0);
  const [audioReserveCount, setAudioReserveCount] = useState(0);

  const [error, setError] = useState(null);

  // Get the current context (course and roles) from backend
  const retrieveContext = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/context?ltik=${ltik}`)
        .then(res => {
          const { course: c, roles: r, userid: u, onCampus: oc } = res.data;
          setCourse(c);
          setRoles(r);
          setUserid(u);
          setOnCampusStatus(oc);
          setError(null);
        })
        .catch(err => {
          setError({
            err,
            msg: 'Something went wrong when retrieving app context...',
          });
        });
    });
  };
  useEffect(retrieveContext, []);

  // Functions that determine roles
  const userIsAdmin = () =>
    roles && (roles.includes('admin') || roles.includes('administrator'));
  const userIsInstructor = () =>
    roles && (roles.includes('teacher') || roles.includes('instructor'));

  // Get the number of medias for each tab
  const retrieveNums = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/counts?ltik=${ltik}`)
        .then(res => {
          const { bruincasts, videos, audios } = res.data;
          setBruincastCount(bruincasts);
          setVideoReserveCount(videos);
          setAudioReserveCount(audios);
          setError(null);
        })
        .catch(err => {
          setError({
            err,
            msg:
              'Something went wrong when getting the number of media entries...',
          });
        });
    });
  };
  useEffect(retrieveNums, []);

  // Get notice from backend
  // Declaring function only; called in Bruincast component
  const [warning, setWarning] = useState('');
  // Bool that prevents retrieving warning from db every loads.
  const [retrievedWarning, setRetrievedWarning] = useState(false);
  const retrieveWarning = () => {
    // Already allowing hot notice update in front-end after submitting new notice in admin panel.
    // Hot notice update is faster than going to db so we only go to db once when there's no notice.
    if (!retrievedWarning) {
      ltikPromise
        .then(ltik => {
          axios.get(`/api/medias/bruincast/notice?ltik=${ltik}`).then(res => {
            setWarning(dompurify.sanitize(res.data));
            setRetrievedWarning(true);
            setError(null);
          });
        })
        .catch(err => {
          setError({
            err,
            msg: 'Something went wrong when retrieving bruincast notice',
          });
        });
    }
  };

  const videoReservesTabEnabled = () =>
    videoReserveCount > 0 || userIsInstructor() || userIsAdmin();

  // Display admin tab only when 'roles' contains 'admin'
  let adminPanel = null;
  if (userIsAdmin()) {
    adminPanel = (
      <Tabs.Panel
        id="adminPanel"
        renderTitle="Admin Panel"
        isSelected={tabSelectedIndex === constants.TABS.ADMIN_PANEL}
      >
        <AdminPanel
          warning={warning}
          setWarning={setWarning}
          retrieveNums={retrieveNums}
          setError={setError}
        />
      </Tabs.Panel>
    );
  }

  // JSX
  return (
    <View>
      {error && <ErrorAlert err={error.err} msg={error.msg} />}
      <Tabs onRequestTabChange={handleTabChange}>
        <Tabs.Panel
          id="bruincast"
          renderTitle={`${
            constants.mediaTypeMap.get(constants.MEDIA_TYPE.BRUINCAST).string
          } (${bruincastCount})`}
          selected={tabSelectedIndex === constants.TABS.BRUINCAST}
        >
          <Bruincast
            course={course}
            warning={warning}
            retrieveWarning={retrieveWarning}
            userid={userid}
            setError={setError}
          />
        </Tabs.Panel>
        {videoReservesTabEnabled() && (
          <Tabs.Panel
            id="videoReserves"
            renderTitle={`${
              constants.mediaTypeMap.get(constants.MEDIA_TYPE.VIDEO_RESERVES)
                .string
            } (${videoReserveCount})`}
            selected={tabSelectedIndex === constants.TABS.VIDEO_RESERVES}
          >
            <VideoReserve
              course={course}
              onCampus={onCampusStatus}
              userid={userid}
              setError={setError}
            />
          </Tabs.Panel>
        )}
        <Tabs.Panel
          id="audioReserves"
          renderTitle={`${
            constants.mediaTypeMap.get(
              constants.MEDIA_TYPE.DIGITAL_AUDIO_RESERVES
            ).string
          } (${audioReserveCount})`}
          isSelected={
            tabSelectedIndex ===
            constants.TABS.DIGITAL_AUDIO_RESERVES -
              (!videoReservesTabEnabled() ? 1 : 0) // Reindex if VideoReserve tab is hidden
          }
        >
          <MusicReserve userid={userid} setError={setError} />
        </Tabs.Panel>
        <Tabs.Panel
          id="mediaGallery"
          renderTitle={
            constants.mediaTypeMap.get(constants.MEDIA_TYPE.MEDIA_GALLERY)
              .string
          }
          isSelected={
            tabSelectedIndex ===
            constants.TABS.MEDIA_GALLERY - (!videoReservesTabEnabled() ? 1 : 0) // Reindex if VideoReserve tab is hidden
          }
        >
          Media Gallery
        </Tabs.Panel>
        {adminPanel}
      </Tabs>
    </View>
  );
};

export default App;
