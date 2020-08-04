import React from 'react';
import PropTypes from 'prop-types';

import { Table } from '@instructure/ui-table';
import { ToggleGroup } from '@instructure/ui-toggle-details';

import { TitleCommentBlock } from './TitleCommentBlock';
import { PlayButtonGroup } from '../PlayButtonGroup';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

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

  const [toggled, setToggled] = useSemiPersistentState(
    `toggled_${shortname}_Week${weekNum}`,
    false
  );

  const handleToggling = (event, expanded) => {
    setToggled(expanded);
  };

  return (
    <ToggleGroup
      id={`${shortname}_week${weekNum}`}
      toggleLabel={`Week ${weekNum}`}
      summary={`Week ${weekNum}`}
      background="default"
      toggled={toggled === true}
      onToggle={handleToggling}
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
            <Table.Row key={`listing${cast.date}`}>
              <Table.Cell>{cast.date}</Table.Cell>
              <Table.Cell>
                <PlayButtonGroup
                  audios={cast.audios}
                  videos={cast.videos}
                  selectMedia={selectMedia}
                  course={course}
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
    </ToggleGroup>
  );
};
