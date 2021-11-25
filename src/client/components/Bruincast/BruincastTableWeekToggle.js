import React from 'react';
import PropTypes from 'prop-types';

import { Table } from '@instructure/ui-table';
import { ToggleDetails } from '@instructure/ui-toggle-details';

import { TitleCommentBlock } from './TitleCommentBlock';
import { PlayButtonGroup } from '../PlayButtonGroup';

const constants = require('../../../../constants');

export const BruincastTableWeekToggle = ({
  weekNum,
  weekCasts,
  selectMedia,
  course,
  shortname,
  setError,
}) => {
  BruincastTableWeekToggle.propTypes = {
    weekNum: PropTypes.number,
    weekCasts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
    setError: PropTypes.func,
  };

  let toggleSummary = `Week ${weekNum}`;
  if (weekNum === 88) {
    toggleSummary = 'Finals Week';
  }

  return (
    <ToggleDetails
      id={`${shortname}_week${weekNum}`}
      summary={toggleSummary}
      variant="filled"
      defaultExpanded
    >
      <Table
        id={`${shortname}_tableWeek${weekNum}`}
        hover
        caption={`BruinCast Media for Week ${weekNum}`}
      >
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="date">Date</Table.ColHeader>
            <Table.ColHeader id="play" width="260px">
              Play
            </Table.ColHeader>
            <Table.ColHeader id="description">Description</Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {weekCasts.map((cast) => (
            <Table.Row key={`${cast.date}`}>
              <Table.Cell>{cast.date}</Table.Cell>
              <Table.Cell>
                <PlayButtonGroup
                  key={cast.audio || cast.video}
                  audio={cast.audio}
                  video={cast.video}
                  selectMedia={selectMedia}
                  course={course}
                  mediaType={constants.MEDIA_TYPE.BRUINCAST}
                  playbackMap={cast.playbackMap}
                  remainingMap={cast.remainingMap}
                  finishedMap={cast.finishedMap}
                  setError={setError}
                />
              </Table.Cell>
              <Table.Cell>
                <TitleCommentBlock
                  title={cast.title}
                  comments={cast.comments}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </ToggleDetails>
  );
};
