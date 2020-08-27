/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Table } from '@instructure/ui-table';
import { ProgressCircle } from '@instructure/ui-progress';
import { Text } from '@instructure/ui-text';
import { View } from '@instructure/ui-view';

export const Analytics = ({ analytics, allUsers, allTitles }) => {
  Analytics.propTypes = {
    analytics: PropTypes.object,
    allUsers: PropTypes.array,
    allTitles: PropTypes.array,
  };

  return allUsers.map(user => (
    <ToggleDetails
      id={`user${user.userid}`}
      key={`user${user.userid}`}
      variant="filled"
      summary={
        <View>
          <Text>{user.name}</Text>
          <ProgressCircle
            size="small"
            margin="0 0 0 xx-large"
            screenReaderLabel="Viewed contents"
            valueNow={
              analytics.has(user.userid)
                ? analytics.get(user.userid).finishedCount
                : 0
            }
            valueMax={allTitles.length}
            shouldAnimateOnMount
            formatScreenReaderValue={({ valueNow, valueMax }) =>
              `${valueNow} out of ${valueMax}`
            }
            renderValue={({ valueNow, valueMax }) => (
              <span>
                <Text size="medium" weight="bold">
                  {valueNow}
                </Text>
                <br />
                <Text size="small">/&nbsp;</Text>
                <Text size="small">{valueMax}</Text>
              </span>
            )}
          />
        </View>
      }
    >
      <Table caption="Analytics" hover>
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="title">Media title</Table.ColHeader>
            <Table.ColHeader id="progress">Progress</Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {allTitles.map(title => (
            <Table.Row key={`title ${title}`}>
              <Table.RowHeader>{title}</Table.RowHeader>
              <Table.Cell>
                <ProgressCircle
                  size="small"
                  screenReaderLabel="Percent complete"
                  shouldAnimateOnMount
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
                    analytics.has(user.userid) &&
                    analytics.get(user.userid).analytics.has(title)
                      ? analytics.get(user.userid).analytics.get(title).time +
                        analytics.get(user.userid).analytics.get(title)
                          .remaining
                      : 100
                  }
                  valueNow={
                    analytics.has(user.userid) &&
                    analytics.get(user.userid).analytics.has(title)
                      ? analytics.get(user.userid).analytics.get(title).time +
                        (analytics.get(user.userid).analytics.get(title)
                          .finishedTimes
                          ? analytics.get(user.userid).analytics.get(title)
                              .remaining
                          : 0)
                      : 0
                  }
                />
                {analytics.has(user.userid) &&
                  analytics.get(user.userid).analytics.has(title) &&
                  analytics.get(user.userid).analytics.get(title)
                    .finishedTimes && (
                    <Text>
                      {`Finished ${
                        analytics.get(user.userid).analytics.get(title)
                          .finishedTimes
                      } time${
                        analytics.get(user.userid).analytics.get(title)
                          .finishedTimes <= 1
                          ? ''
                          : 's'
                      }`}
                    </Text>
                  )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </ToggleDetails>
  ));
};
