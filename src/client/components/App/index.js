import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import './app.css';
import dompurify from 'dompurify';

import { Tabs } from '@instructure/ui-tabs';

import { Bruincast } from '../Bruincast';
import { AdminPanel } from '../AdminPanel';

import * as constants from '../../constants';

theme.use();

const App = () => {
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TAB_BRUINCAST);
  const [lastIndex, setLastIndex] = useState(constants.TAB_BRUINCAST);
  const handleTabChange = (event, { index }) => {
    setLastIndex(tabSelectedIndex);
    selectTabIndex(index);
  };

  const [course, setCourse] = useState({});
  const sampleCasts = [
    {
      id: 0,
      title: 'Sample',
      comments: ['Sample'],
      date: new Date(2020, 2, 14),
      audios: [''],
      videos: ['eeb162-1-20200331-18431.mp4'],
    },
    {
      id: 1,
      title: 'Content is from CS 32 (Winter 2012)',
      comments: ['Date of lecture: 3/7/2012'],
      date: new Date(2020, 2, 7),
      audios: [''],
      videos: ['cs32-1-20200506-18379.mp4'],
    },
    {
      id: 2,
      title: 'Content is from CS 32 (Winter 2012)',
      comments: ['Date of lecture: 3/5/2012'],
      date: new Date(2020, 2, 5),
      audios: [],
      videos: ['cs32-1-20200504-18378.mp4'],
    },
  ];
  const sampleCourse = {
    srs: 0,
    title: 'CS 32',
    casts: sampleCasts,
    quarter: 'Spring 2020',
  };
  const retrieveCourse = () => {
    // HTTP request here
    setCourse(sampleCourse);
  };

  useEffect(retrieveCourse, []);

  const [coursesWithCasts, setCoursesWithCasts] = useState([]);
  // Add in more nums states for video/audio reserves
  const [numCasts, setNumCasts] = useState(0);
  const [videoReserves, setVideoReserves] = useState([]);
  const [audioReserves, setAudioReserves] = useState([]);

  const sampleCoursesWithCasts = [
    sampleCourse,
    {
      srs: 1,
      title: 'Placeholder course',
      quarter: 'Winter 2019',
      casts: [
        {
          id: 3,
          title: 'Lecture',
          comments: ['Audio level is low, again', 'Another comment yay!'],
          date: new Date(2020, 3, 8),
          audios: ['just a fake audio name'],
          videos: [''],
        },
      ],
    },
  ];

  const retrieveCasts = () => {
    // Do HTTP requests & some logics here
    let count = 0;
    for (const currCourse of sampleCoursesWithCasts) {
      currCourse.casts.sort((a, b) => a.date - b.date);
      count += currCourse.casts.length;
    }
    setCoursesWithCasts(sampleCoursesWithCasts);
    setNumCasts(count);
  };
  useEffect(retrieveCasts, []);

  const [warning, setWarning] = useState('');
  // Bool that prevents retrieving warning from db every loads.
  const [retrievedWarning, setRetrievedWarning] = useState(false);
  const retrieveWarning = () => {
    // Already allowing hot notice update in front-end after submitting new notice in admin panel.
    // Hot notice update is faster than going to db so we only go to db once when there's no notice.
    if (!retrievedWarning) {
      // Some backend logics here.
      const res = '<p>A default notice</p>';
      setWarning(dompurify.sanitize(res));
      setRetrievedWarning(true);
    }
  };

  const [role, setRole] = useState('');
  const retrieveRole = () => {
    // Backend logic here
    const res = 'admin';
    setRole(res);
  };
  useEffect(retrieveRole, []);

  let adminPanel = null;
  if (role && role === 'admin') {
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
        />
      </Tabs.Panel>
    );
  }

  return (
    <Tabs onRequestTabChange={handleTabChange}>
      <Tabs.Panel
        id="bruincast"
        renderTitle={`Bruincasts (${numCasts})`}
        selected={tabSelectedIndex === constants.TAB_BRUINCAST}
      >
        <Bruincast
          course={course}
          coursesWithCasts={coursesWithCasts}
          retrieveCasts={retrieveCasts}
          warning={warning}
          retrieveWarning={retrieveWarning}
        />
      </Tabs.Panel>
      <Tabs.Panel
        id="videoReserves"
        renderTitle={`Video reserves (${videoReserves.length})`}
        selected={tabSelectedIndex === constants.TAB_VIDEO_RESERVES}
      >
        Video Reserves
      </Tabs.Panel>
      <Tabs.Panel
        id="audioReserves"
        renderTitle={`Digital audio reserves (${audioReserves.length})`}
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
