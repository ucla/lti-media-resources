import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import './app.css';
import dompurify from 'dompurify';
import axios from 'axios';

import { Tabs } from '@instructure/ui-tabs';

import { Bruincast } from '../Bruincast';
import { VideoReserve } from '../VideoReserve';
import { MusicReserve } from '../MusicReserve';
import { AdminPanel } from '../AdminPanel';

import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

theme.use();

const App = () => {
  // Logic of changing tabs
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TAB_BRUINCAST);
  const handleTabChange = (event, { index }) => {
    selectTabIndex(index);
  };

  // Declare states
  const [course, setCourse] = useState({});
  const [roles, setRoles] = useState([]);
  const [onCampusStatus, setOnCampusStatus] = useState(true);
  const [bruincastCount, setBruincastCount] = useState(0);
  const [videoReserveCount, setVideoReserveCount] = useState(0);
  const [audioReserveCount, setAudioReserveCount] = useState(0);

  // Get the current context (course and roles) from backend
  const retrieveContext = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/context?ltik=${ltik}`).then(res => {
        const { course: c, roles: r, onCampus: oc } = res.data;
        setCourse(c);
        setRoles(r);
        setOnCampusStatus(oc);
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
      axios.get(`/api/medias/counts?ltik=${ltik}`).then(res => {
        const { bruincasts, videos, audios } = res.data;
        setBruincastCount(bruincasts);
        setVideoReserveCount(videos);
        setAudioReserveCount(audios);
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
      ltikPromise.then(ltik => {
        axios.get(`/api/medias/bruincast/notice?ltik=${ltik}`).then(res => {
          setWarning(dompurify.sanitize(res.data));
          setRetrievedWarning(true);
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
        isSelected={tabSelectedIndex === constants.TAB_ADMIN_PANEL}
      >
        <AdminPanel
          warning={warning}
          setWarning={setWarning}
          retrieveNums={retrieveNums}
        />
      </Tabs.Panel>
    );
  }

  // JSX
  return (
    <Tabs onRequestTabChange={handleTabChange}>
      <Tabs.Panel
        id="bruincast"
        renderTitle={`Bruincasts (${bruincastCount})`}
        selected={tabSelectedIndex === constants.TAB_BRUINCAST}
      >
        <Bruincast
          course={course}
          warning={warning}
          retrieveWarning={retrieveWarning}
        />
      </Tabs.Panel>
      {videoReservesTabEnabled() && (
        <Tabs.Panel
          id="videoReserves"
          renderTitle={`Video reserves (${videoReserveCount})`}
          selected={tabSelectedIndex === constants.TAB_VIDEO_RESERVES}
        >
          <VideoReserve course={course} onCampus={onCampusStatus} />
        </Tabs.Panel>
      )}
      <Tabs.Panel
        id="audioReserves"
        renderTitle={`Digital audio reserves (${audioReserveCount})`}
        isSelected={
          tabSelectedIndex ===
          constants.TAB_DIGITAL_AUDIO_RESERVES -
            (!videoReservesTabEnabled() ? 1 : 0) // Reindex if VideoReserve tab is hidden
        }
      >
        <MusicReserve />
      </Tabs.Panel>
      <Tabs.Panel
        id="mediaGallery"
        renderTitle="Media gallery"
        isSelected={
          tabSelectedIndex ===
          constants.TAB_MEDIA_GALLERY - (!videoReservesTabEnabled() ? 1 : 0) // Reindex if VideoReserve tab is hidden
        }
      >
        Media Gallery
      </Tabs.Panel>
      {adminPanel}
    </Tabs>
  );
};

export default App;
