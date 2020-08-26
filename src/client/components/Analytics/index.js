/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Table } from '@instructure/ui-table';
import { ProgressCircle } from '@instructure/ui-progress';
import { Text } from '@instructure/ui-text';

export const Analytics = ({ medias, allUsers }) => {
  Analytics.propTypes = {
    medias: PropTypes.array,
    allUsers: PropTypes.array,
  };

  return medias.map(media => (
    <ToggleDetails
      id={media._id}
      key={media._id}
      variant="filled"
      summary={`${media.title} ${media.date}`}
    >
      <Table caption="Analytics" hover>
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="name">Student Name</Table.ColHeader>
            <Table.ColHeader id="finished">Finished Times</Table.ColHeader>
            <Table.ColHeader id="progression">
              Latest Progression
            </Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {allUsers.map(user => (
            <Table.Row key={user.user_id}>
              <Table.RowHeader>{user.name}</Table.RowHeader>
              <Table.Cell>
                {media.analytics.has(user.userid)
                  ? media.analytics.get(user.userid).finishedTimes
                  : 0}
              </Table.Cell>
              <Table.Cell>
                <ProgressCircle
                  size="small"
                  screenReaderLabel="Percent complete"
                  formatScreenReaderValue={({ valueNow, valueMax }) =>
                    `${Math.round((valueNow / valueMax) * 100)} percent`
                  }
                  renderValue={({ valueNow, valueMax }) => {
                    const percent = Math.round((valueNow / valueMax) * 100);
                    return (
                      <span>
                        <Text size="medium" weight="bold" color="primary">
                          {percent > 100 ? 100 : percent}
                        </Text>
                        <Text size="xx-small" weight="bold" color="secondary">
                          %
                        </Text>
                      </span>
                    );
                  }}
                  valueMax={
                    media.analytics.has(user.userid)
                      ? media.analytics.get(user.userid).time === 0 &&
                        media.analytics.get(user.userid).finishedTimes > 0
                        ? 100
                        : media.analytics.get(user.userid).time +
                          media.analytics.get(user.userid).remaining
                      : 100
                  }
                  valueNow={
                    media.analytics.has(user.userid)
                      ? media.analytics.get(user.userid).time === 0 &&
                        media.analytics.get(user.userid).finishedTimes > 0
                        ? 100
                        : media.analytics.get(user.userid).time
                      : 0
                  }
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </ToggleDetails>
  ));
};
