import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ToggleDetails } from '@instructure/ui-toggle-details';
import { Table } from '@instructure/ui-table';
import { ProgressCircle } from '@instructure/ui-progress';
import { Text } from '@instructure/ui-text';
import { View } from '@instructure/ui-view';
import { TextInput } from '@instructure/ui-text-input';
import { Button } from '@instructure/ui-buttons';
import {
  IconSearchLine,
  IconArrowOpenStartSolid,
  IconAnalyticsSolid,
} from '@instructure/ui-icons';

export const Analytics = ({ analytics, showing, show }) => {
  Analytics.propTypes = {
    analytics: PropTypes.array,
    showing: PropTypes.bool,
    show: PropTypes.func,
  };

  const [searchedName, setSearchedName] = useState('');

  const handleChange = (e, value) => setSearchedName(value);

  if (!analytics || !showing) {
    return (
      <Button
        onClick={show}
        margin="medium 0"
        color="primary"
        renderIcon={<IconAnalyticsSolid />}
      >
        Analytics
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={show}
        margin="medium 0"
        color="primary"
        renderIcon={<IconArrowOpenStartSolid />}
      >
        Back
      </Button>
      <View margin="x-large">
        <TextInput
          renderBeforeInput={<IconSearchLine inline={false} />}
          value={searchedName}
          onChange={handleChange}
          placeholder="Search students' names here. (Format: 'First Last')"
          shouldNotWrap
        />
      </View>
      {analytics
        .filter(analyticOfUser => analyticOfUser.name.includes(searchedName))
        .map(analyticOfUser => (
          <ToggleDetails
            id={`user${analyticOfUser.userid}`}
            key={`user${analyticOfUser.userid}`}
            variant="filled"
            summary={
              <View>
                <Text>{analyticOfUser.name}</Text>
                <ProgressCircle
                  size="small"
                  margin="0 0 0 xx-large"
                  screenReaderLabel="Viewed contents"
                  valueNow={analyticOfUser.finishedCount}
                  valueMax={analyticOfUser.totalCount}
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
                {analyticOfUser.analytics.map(analytic => (
                  <Table.Row key={`title ${analytic.title}`}>
                    <Table.RowHeader>{analytic.title}</Table.RowHeader>
                    <Table.Cell>
                      <ProgressCircle
                        size="small"
                        screenReaderLabel="Percent complete"
                        shouldAnimateOnMount
                        formatScreenReaderValue={({ valueNow, valueMax }) =>
                          `${Math.round((valueNow / valueMax) * 100)}%`
                        }
                        renderValue={({ valueNow, valueMax }) => {
                          const percent = Math.round(
                            (valueNow / valueMax) * 100
                          );
                          return (
                            <span>
                              <Text size="medium" weight="bold" color="primary">
                                {percent}
                              </Text>
                              <Text
                                size="x-small"
                                weight="bold"
                                color="secondary"
                              >
                                %
                              </Text>
                            </span>
                          );
                        }}
                        valueMax={analytic.time + analytic.remaining}
                        valueNow={
                          analytic.time +
                          (analytic.finishedTimes > 0 ? analytic.remaining : 0)
                        }
                      />
                      {analytic.finishedTimes > 0 && (
                        <Text>
                          {`Finished ${analytic.finishedTimes} time${
                            analytic.finishedTimes <= 1 ? '' : 's'
                          }`}
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </ToggleDetails>
        ))}
    </>
  );
};
