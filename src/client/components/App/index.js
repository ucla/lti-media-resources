import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import { EmotionThemeProvider } from '@instructure/emotion'
import dompurify from 'dompurify';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { Tabs } from '@instructure/ui-tabs';
import { Bruincast } from '../Bruincast';
import { VideoReserve } from '../VideoReserve';
import { MusicReserve } from '../MusicReserve';
import { AdminPanel } from '../AdminPanel';
import { ErrorAlert } from './ErrorAlert';

import { getLtik } from '../../services/ltik';

const constants = require('../../../../constants');


axiosRetry(axios);

const App = () => {
  // Logic of changing tabs
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TABS.BRUINCAST);
  const handleTabChange = (event, { index }) => {
    selectTabIndex(index);
  };

  // Declare states
  const [course, setCourse] = useState({});
  const [userid, setUserid] = useState(-1);
  const [onCampusStatus, setOnCampusStatus] = useState(true);

  const [bruincastCount, setBruincastCount] = useState(0);
  const [videoReserveCount, setVideoReserveCount] = useState(0);
  const [audioReserveCount, setAudioReserveCount] = useState(0);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructorOrAdmin, setIsInstructorOrAdmin] = useState(false);

  const [error, setError] = useState(null);

  // Get the current context (course and roles) from backend
  const retrieveContext = () => {
    const ltik = getLtik();
    axios
      .get(`${process.env.LTI_APPROUTE}/api/context?ltik=${ltik}`)
      .then((res) => {
        const { course: c, roles: r, userid: u, onCampus: oc } = res.data;
        setCourse(c);
        setUserid(u);
        setOnCampusStatus(oc);
        if (r && r.includes('administrator')) {
          setIsAdmin(true);
          setIsInstructorOrAdmin(true);
        }
        if (r && r.includes('instructor')) {
          setIsInstructorOrAdmin(true);
        }
        setError(null);
      })
      .catch((err) => {
        setError({
          err,
          msg: 'Something went wrong when retrieving app context...',
        });
      });
  };
  useEffect(retrieveContext, []);

  // Get the number of medias for each tab
  const retrieveNums = () => {
    const ltik = getLtik();
    axios
      .get(`${process.env.LTI_APPROUTE}/api/medias/counts?ltik=${ltik}`)
      .then((res) => {
        const { bruincasts, videos, audios } = res.data;
        setBruincastCount(bruincasts);
        setVideoReserveCount(videos);
        setAudioReserveCount(audios);
        setError(null);
      })
      .catch((err) => {
        setError({
          err,
          msg:
            'Something went wrong when getting the number of media entries...',
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
      const ltik = getLtik();
      axios
        .get(
          `${process.env.LTI_APPROUTE}/api/medias/bruincast/notice?ltik=${ltik}`
        )
        .then((res) => {
          setWarning(dompurify.sanitize(res.data));
          setRetrievedWarning(true);
          setError(null);
        })
        .catch((err) => {
          setError({
            err,
            msg: 'Something went wrong when retrieving bruincast notice',
          });
        });
    }
  };

  const videoReservesTabEnabled = () =>
    videoReserveCount > 0 || isInstructorOrAdmin;

  // Display admin tab only when 'roles' contains 'admin'
  let adminPanel = null;
  if (isAdmin) {
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
    <EmotionThemeProvider theme={theme}>
      {error && <ErrorAlert err={error.err} msg={error.msg} />}
      <Tabs onRequestTabChange={handleTabChange}>
        <Tabs.Panel
          id="bruincast"
          renderTitle={`${
            constants.mediaTypeMap.get(constants.MEDIA_TYPE.BRUINCAST).string
          } (${bruincastCount})`}
          isSelected={tabSelectedIndex === constants.TABS.BRUINCAST}
        >
          <Bruincast
            course={course}
            warning={warning}
            retrieveWarning={retrieveWarning}
            userid={userid}
            isInstructorOrAdmin={isAdmin}
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
            isSelected={tabSelectedIndex === constants.TABS.VIDEO_RESERVES}
          >
            <VideoReserve
              course={course}
              onCampus={onCampusStatus}
              userid={userid}
              isInstructorOrAdmin={isInstructorOrAdmin}
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
          <MusicReserve
            userid={userid}
            isInstructorOrAdmin={isInstructorOrAdmin}
            setError={setError}
          />
        </Tabs.Panel>
        {adminPanel}
      </Tabs>
    </EmotionThemeProvider>
  );
};

export default App;
