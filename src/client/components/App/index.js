import React, { useState, useEffect } from 'react';
import '@instructure/canvas-theme';
import './app.css';
import ReactJWPlayer from 'react-jw-player';

import { Tabs } from '@instructure/ui-tabs';
import { View } from '@instructure/ui-view';
import { CondensedButton } from '@instructure/ui-buttons';

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
      audios: ['anthro169-1-20191206-16099.mp3'],
      videos: [''],
    },
    {
      id: 1,
      title: 'Lecture',
      comments: [],
      date: new Date(2020, 1, 17),
      audios: [''],
      videos: ['psych115-1-20191206-16104.mp4'],
    },
    {
      id: 2,
      title: 'Lecture',
      comments: ['Comment 1', 'Comment 2'],
      date: new Date(2020, 1, 13),
      audios: [],
      videos: ['hist22-1-20191202-15938.mp4'],
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
      casts: [
        {
          id: 3,
          title: 'Lecture',
          comments: ['Audio level is low, again', 'Another comment yay!'],
          date: new Date(2020, 3, 8),
          audios: [''],
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

  const [selectedMediaURL, setSelectedMediaURL] = React.useState('');
  const selectMediaURL = () => {
    setSelectedMediaURL('http://techslides.com/demos/sample-videos/small.mp4');
    console.log('set!');
  };
  const deselectMediaURL = () => {
    setSelectedMediaURL('');
  };

  if (selectedMediaURL && selectedMediaURL !== '') {
    return (
      <View>
        <ReactJWPlayer
          playerId="1"
          playerScript="https://cdn.jwplayer.com/libraries/q3GUgsN9.js"
          file={selectedMediaURL}
        />
        <CondensedButton
          onClick={deselectMediaURL}
          display="block"
          margin="medium"
        >
          {'< Back'}
        </CondensedButton>
      </View>
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
          selectMediaURL={selectMediaURL}
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
