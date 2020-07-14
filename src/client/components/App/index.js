import React, { useState, useEffect } from 'react';
import theme from '@instructure/canvas-high-contrast-theme';
import './app.css';

import { Tabs } from '@instructure/ui-tabs';

import { Bruincast } from '../Bruincast';

import { ltikPromise } from '../../services/ltik';
import * as constants from '../../constants';

const App = () => {
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TAB_BRUINCAST);
  const handleTabChange = (event, { index }) => {
    selectTabIndex(index);
  };

  const [course, setCourse] = useState({});
  const sampleCasts = [
    {
      id: 0,
      title: 'Lecture',
      comments: ['Audio level is low'],
      date: new Date(2020, 1, 6),
    },
    {
      id: 1,
      title: 'Lecture',
      comments: [],
      date: new Date(2020, 1, 17),
    },
    {
      id: 2,
      title: 'Lecture',
      comments: [],
      date: new Date(2020, 1, 13),
    },
  ];
  const sampleCourse = {
    id: 0,
    title: 'Sample Course',
    casts: sampleCasts,
  };
  const retrieveCourse = () => {
    // HTTP request here
    setCourse(sampleCourse);
  };

  useEffect(retrieveCourse, []);

  const [coursesWithCasts, setCoursesWithCasts] = useState([]);
  const [numCasts, setNumCasts] = useState(0);
  const [videoReserves, setVideoReserves] = useState([]);
  const [audioReserves, setAudioReserves] = useState([]);

  const sampleCoursesWithCasts = [
    sampleCourse,
    {
      id: 1,
      title: 'Placeholder course',
      casts: [],
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
    </Tabs>
  );
};

export default App;
