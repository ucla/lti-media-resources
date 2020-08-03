import React from 'react';
import PropTypes from 'prop-types';

import { Table } from '@instructure/ui-table';

import { TitleCommentBlock } from './TitleCommentBlock';
import { PlayButtonGroup } from '../PlayButtonGroup';

export const BruincastTable = ({ casts, selectMedia, course }) => {
  BruincastTable.propTypes = {
    casts: PropTypes.array,
    selectMedia: PropTypes.func,
    course: PropTypes.object,
  };

  return (
    <Table hover>
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
        {casts.map(cast => (
          <Table.Row>
            <Table.Cell>{cast.date.toDateString()}</Table.Cell>
            <Table.Cell>
              <PlayButtonGroup
                audios={cast.audios}
                videos={cast.videos}
                selectMedia={selectMedia}
                course={course}
              />
            </Table.Cell>
            <Table.Cell>
              <TitleCommentBlock title={cast.title} comments={cast.comments} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
