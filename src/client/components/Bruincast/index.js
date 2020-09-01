/* eslint-disable react/no-danger */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { View } from '@instructure/ui-view';
import { Tabs } from '@instructure/ui-tabs';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Text } from '@instructure/ui-text';
import axiosRetry from 'axios-retry';
import { Button } from '@instructure/ui-buttons';
import { Link } from '@instructure/ui-link';
import { IconArrowUpLine, IconArrowDownLine } from '@instructure/ui-icons';

import { BruincastTable } from './BruincastTable';
import { MediaView } from '../MediaView';

import { getLtik } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export const Bruincast = ({
  course,
  warning,
  retrieveWarning,
  userid,
  isInstructorOrAdmin,
  setError,
}) => {
  Bruincast.propTypes = {
    course: PropTypes.object,
    warning: PropTypes.string,
    retrieveWarning: PropTypes.func,
    userid: PropTypes.number,
    isInstructorOrAdmin: PropTypes.bool,
    setError: PropTypes.func,
  };

  // Get bruincast medias for all crosslisted courses
  const [castsByCourses, setCasts] = useState([]);
  const retrieveCasts = () => {
    const ltik = getLtik();
    axios
      .get(`/api/medias/bruincast/casts?ltik=${ltik}`)
      .then(res => {
        const tmpCastsByCourses = res.data;
        for (const tmpCourse of tmpCastsByCourses) {
          for (const listObj of tmpCourse.casts) {
            for (const tmpCast of listObj.listings) {
              const playbackMap = new Map();
              const remainingMap = new Map();
              const finishedMap = new Map();
              for (const tmpPlayback of tmpCast.playbackArr) {
                playbackMap.set(tmpPlayback.file, tmpPlayback.playback);
                remainingMap.set(tmpPlayback.file, tmpPlayback.remaining);
                finishedMap.set(tmpPlayback.file, tmpPlayback.finished);
              }
              tmpCast.playbackMap = playbackMap;
              tmpCast.remainingMap = remainingMap;
              tmpCast.finishedMap = finishedMap;
            }
          }
        }
        setCasts(tmpCastsByCourses);
        setError(null);
      })
      .catch(err => {
        setError({
          err,
          msg: 'Something went wrong when retrieving Bruincast contents...',
        });
      });
  };
  useEffect(retrieveCasts, []);

  const [analytics, setAnalytics] = useState(null);
  const retrieveAnalytics = () => {
    if (isInstructorOrAdmin) {
      const ltik = getLtik();
      axios.get(`/api/medias/bruincast/analytics?ltik=${ltik}`).then(res => {
        setAnalytics(res.data);
      });
    }
  };
  useEffect(retrieveAnalytics, [isInstructorOrAdmin]);

  const reverseCastsOrder = () => {
    for (const currCourse of castsByCourses) {
      currCourse.casts.reverse();
      for (const weekCasts of currCourse.casts) {
        weekCasts.listings.reverse();
      }
    }
  };

  const [ascendingSort, setAscendingSort] = useState(true);
  const handleSortButtonClick = () => {
    setAscendingSort(!ascendingSort);
    reverseCastsOrder();
  };

  // Logic when a media is selected and to be played
  // Declaring functions only
  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = obj => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  const hotReloadPlayback = (
    classShortname,
    file,
    playback,
    remaining,
    finished
  ) => {
    const toBeSet = castsByCourses;
    const matchedCourse = toBeSet.filter(
      obj => obj.course.label === classShortname
    )[0];
    for (const listObj of matchedCourse.casts) {
      for (const cast of listObj.listings) {
        if (cast.video.includes(file) || cast.audio.includes(file)) {
          cast.playbackMap.set(file, playback);
          cast.remainingMap.set(file, remaining);
          if (finished) {
            if (cast.finishedMap.has(file)) {
              cast.finishedMap.set(file, cast.finishedMap.get(file) + 1);
            } else {
              cast.finishedMap.set(file, 1);
            }
          }
        }
      }
    }
    // Force reload by state change
    setCasts([]);
    setCasts(toBeSet);
  };

  // Get notice from backend
  useEffect(retrieveWarning, []);

  // Display notice box only when a notice exists
  let warningElement = null;
  if (warning && warning !== '' && warning !== '<p><br></p>') {
    warningElement = (
      <Alert variant="warning" renderCloseButtonLabel="Close">
        <div dangerouslySetInnerHTML={{ __html: warning }} />
      </Alert>
    );
  }

  // Logic for changing tabs
  const [courseIndex, setCourseIndex] = useState(0);
  const handleCourseChange = (event, { index }) => {
    setCourseIndex(index);
  };

  // JSX if playing a media
  if (
    selectedMedia.url &&
    selectedMedia.url !== '' &&
    selectedMedia.format &&
    selectedMedia.format !== ''
  ) {
    return (
      <MediaView
        media={selectedMedia}
        userid={userid}
        mediaType={constants.MEDIA_TYPE.BRUINCAST}
        hotReloadPlayback={hotReloadPlayback}
        deSelectMedia={deselectMedia}
        setError={setError}
      />
    );
  }

  // JSX if not playing a media
  return (
    <View>
      <Heading>{`Bruincast: ${course.title}`}</Heading>
      {warningElement}
      <Text>
        Video recordings may take up to 24 hours before they are available. For
        help regarding Bruincast content, please read our{' '}
        <Link
          href="https://docs.ccle.ucla.edu/index.php?title=BruinCast"
          target="_blank"
          rel="noopener noreferrer"
        >
          help document
        </Link>
        .
      </Text>
      <br />
      <div>
        <Button
          renderIcon={ascendingSort ? IconArrowUpLine : IconArrowDownLine}
          onClick={handleSortButtonClick}
        >
          Sort by date
        </Button>
      </div>
      <br />
      <Tabs onRequestTabChange={handleCourseChange} variant="secondary">
        {castsByCourses.map((currCourse, i) => (
          <Tabs.Panel
            id={currCourse.course.label}
            key={currCourse.course.label}
            renderTitle={currCourse.course.label}
            isSelected={courseIndex === i}
          >
            <BruincastTable
              key={currCourse.course.label}
              casts={currCourse.casts}
              selectMedia={selectMedia}
              course={currCourse.course}
              shortname={currCourse.course.label}
              analytics={
                analytics
                  ? analytics.filter(
                      analytic =>
                        analytic.course.label === currCourse.course.label
                    )[0].analytics
                  : null
              }
              setError={setError}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </View>
  );
};
