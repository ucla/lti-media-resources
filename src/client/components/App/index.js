import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import './app.css';
import dompurify from 'dompurify';
import axios from 'axios';

import { Tabs } from '@instructure/ui-tabs';

import { Bruincast } from '../Bruincast';
import { AdminPanel } from '../AdminPanel';

import * as constants from '../../constants';
import { ltikPromise } from '../../services/ltik';

theme.use();

const App = () => {
  // Logic of changing tabs
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TAB_BRUINCAST);
  const [lastIndex, setLastIndex] = useState(constants.TAB_BRUINCAST);
  const handleTabChange = (event, { index }) => {
    setLastIndex(tabSelectedIndex);
    selectTabIndex(index);
  };

  // Declare states
  const [course, setCourse] = useState({});
  // Add in more nums states for video/audio reserves
  const [bruincastCount, setBruincastCount] = useState(0);
  const [videoReserveCount, setVideoReserveCount] = useState(0);
  const [audioReserveCount, setAudioReserveCount] = useState(0);

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

  // Get the current course from backend
  const retrieveCourse = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/course?ltik=${ltik}`).then(res => {
        setCourse(res.data);
      });
    });
  };
  useEffect(retrieveCourse, []);

  // Get all crosslisted courses of the current course
  // Declaring function only; called in Bruincast component
  const [crosslist, setCrosslist] = useState([]);
  const retrieveCrosslist = () => {
    if (course.label) {
      ltikPromise.then(ltik => {
        axios
          .get(`/api/medias/bruincast/crosslist?ltik=${ltik}`, {
            params: {
              courseLabel: course.label,
            },
          })
          .then(res => {
            setCrosslist(res.data);
          });
      });
    }
  };

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

  // Get the role of the current user
  const [roles, setRoles] = useState([]);
  const retrieveRole = () => {
    ltikPromise.then(ltik => {
      axios.get(`/api/roles?ltik=${ltik}`).then(res => {
        setRoles(res.data);
      });
    });
  };
  useEffect(retrieveRole, []);

  // Display admin tab only when 'roles' contains 'admin'
  let adminPanel = null;
  if (roles && (roles.includes('admin') || roles.includes('administrator'))) {
    adminPanel = (
      <Tabs.Panel
        id="adminPanel"
        renderTitle="Admin Panel"
        isSelected={tabSelectedIndex === constants.TAB_ADMIN_PANEL}
      >
        <AdminPanel
          warning={warning}
          setWarning={setWarning}
          selectTabIndex={selectTabIndex}
          lastIndex={lastIndex}
          crosslist={crosslist}
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
          crosslist={crosslist}
          retrieveCrosslist={retrieveCrosslist}
        />
      </Tabs.Panel>
      <Tabs.Panel
        id="videoReserves"
        renderTitle={`Video reserves (${videoReserveCount})`}
        selected={tabSelectedIndex === constants.TAB_VIDEO_RESERVES}
      >
        Video Reserves
      </Tabs.Panel>
      <Tabs.Panel
        id="audioReserves"
        renderTitle={`Digital audio reserves (${audioReserveCount})`}
        isSelected={tabSelectedIndex === constants.TAB_DIGITAL_AUDIO_RESERVES}
      >
        Digital Audio Reserves
      </Tabs.Panel>
      <Tabs.Panel
        id="mediaGallery"
        renderTitle="Media gallery"
        isSelected={tabSelectedIndex === constants.TAB_MEDIA_GALLERY}
      >
        Media Gallery
      </Tabs.Panel>
      {adminPanel}
    </Tabs>
  );
};

export default App;
