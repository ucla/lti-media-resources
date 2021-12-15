/* eslint-disable react/no-danger */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { Tabs } from '@instructure/ui-tabs';
import { Heading } from '@instructure/ui-heading';
import { Alert } from '@instructure/ui-alerts';
import { Text } from '@instructure/ui-text';
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
      .get(
        `${process.env.LTI_APPROUTE}/api/medias/bruincast/casts?ltik=${ltik}`
      )
      .then((res) => {
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
        // If empty casts array, display "No media found" alert.
        if (tmpCastsByCourses.length === 0) {
          setError({
            err: '',
            msg: 'No BruinCast media found.',
          });
        } else {
          setError(null);
        }
      })
      .catch((err) => {
        setError({
          err,
          msg: 'Something went wrong when retrieving BruinCast contents...',
        });
      });
  };
  // Loads Bruincasts (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveCasts, []);

  // Get analytics data if user is instructor or admin
  const [analytics, setAnalytics] = useState(null);
  const retrieveAnalytics = () => {
    if (isInstructorOrAdmin) {
      const ltik = getLtik();
      axios
        .get(`${process.env.LTI_APPROUTE}/api/medias/analytics?ltik=${ltik}`, {
          params: { mediaType: constants.MEDIA_TYPE.BRUINCAST },
        })
        .then((res) => {
          setAnalytics(res.data);
        });
    }
  };
  useEffect(retrieveAnalytics, [isInstructorOrAdmin]);

  // An onclick handler to reverse the display order of bruincasts
  const reverseCastsOrder = () => {
    for (const currCourse of castsByCourses) {
      currCourse.casts.reverse();
      for (const weekCasts of currCourse.casts) {
        weekCasts.listings.reverse();
      }
    }
  };

  // A state indicating which order bruincasts are sorted
  const [ascendingSort, setAscendingSort] = useState(true);
  const handleSortButtonClick = () => {
    setAscendingSort(!ascendingSort);
    reverseCastsOrder();
  };

  // Logic when a media is selected and to be played
  // Declaring functions only
  const [selectedMedia, setSelectedMedia] = React.useState({});
  const selectMedia = (obj) => {
    setSelectedMedia(obj);
  };
  const deselectMedia = () => {
    setSelectedMedia({});
  };

  // After users stop watching a video, their progress are updated and displayed immediately
  // This function is fed to MediaPlayer as a prop
  const hotReloadPlayback = (
    classShortname,
    file,
    playback,
    remaining,
    finished
  ) => {
    const toBeSet = castsByCourses;
    const matchedCourse = toBeSet.filter(
      (obj) => obj.course.label === classShortname
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

  // Get notice from backend (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // State indicating if the user sees analytics or bruincast table
  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const showAnalytics = () => {
    setShowingAnalytics(!showingAnalytics);
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
    <>
      <Heading>{`BruinCast: ${course.title}`}</Heading>
      {warningElement}
      <Text>
        Video recordings may take up to 24 hours before they are available. For
        help regarding BruinCast content, please read our{' '}
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
                      (analytic) =>
                        analytic.course.label === currCourse.course.label
                    )[0].analytics
                  : null
              }
              showingAnalytics={showingAnalytics}
              showAnalytics={showAnalytics}
              setError={setError}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
};
