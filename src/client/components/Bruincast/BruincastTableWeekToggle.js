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
}) => {
  BruincastTableWeekToggle.propTypes = {
    weekNum: PropTypes.string,
    weekCasts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
    shortname: PropTypes.string,
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
        caption={`Bruincast Media for Week ${weekNum}`}
      >
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="date" width="15%">
              Date
            </Table.ColHeader>
            <Table.ColHeader id="action" width="15%">
              Action
            </Table.ColHeader>
            <Table.ColHeader id="des" width="70%">
              Description
            </Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {weekCasts.map(cast => (
            <Table.Row key={`${cast.date}`}>
              <Table.Cell>{cast.date}</Table.Cell>
              <Table.Cell>
                <PlayButtonGroup
                  key={cast.audio || cast.video}
                  audio={cast.audio}
                  video={cast.video}
                  selectMedia={selectMedia}
                  course={course}
                  tab={constants.TAB_BRUINCAST}
                  playbackMap={cast.playbackMap}
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
