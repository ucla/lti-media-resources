import React, { useState, useEffect } from 'react';
import { theme } from '@instructure/canvas-theme';
import './app.css';

import { Tabs } from '@instructure/ui-tabs';
import { View } from '@instructure/ui-view';
import { CondensedButton } from '@instructure/ui-buttons';

import { Bruincast } from '../Bruincast';
import { MediaPlayer } from '../MediaPlayer';

import * as constants from '../../constants';

theme.use();

const App = () => {
  const [tabSelectedIndex, selectTabIndex] = useState(constants.TAB_BRUINCAST);
  const handleTabChange = (event, { index }) => {
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

  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = obj => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  if (
    selectedMedia.url &&
    selectedMedia.url !== '' &&
    selectedMedia.type &&
    selectedMedia.type !== ''
  ) {
    return (
      <View>
        <View>{selectedMedia.url}</View>
        <MediaPlayer mediaURL={selectedMedia.url} type={selectedMedia.type} />
        <CondensedButton
          onClick={deselectMedia}
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
          selectMedia={selectMedia}
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
