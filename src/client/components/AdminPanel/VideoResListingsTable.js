import React from 'react';
import PropTypes from 'prop-types';

import { Text } from '@instructure/ui-text';
import { Table } from '@instructure/ui-table';

export const VideoResListingsTable = ({ shortname, listings }) => {
  VideoResListingsTable.propTypes = {
    shortname: PropTypes.string,
    listings: PropTypes.array,
  };

  return (
    <Table
      id={`table${shortname}`}
      hover
      layout="fixed"
      caption={`Video Reserves listings for ${shortname}`}
    >
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="term" width="5%">
            Term
          </Table.ColHeader>
          <Table.ColHeader id="classID" width="15%">
            Class ID
          </Table.ColHeader>
          <Table.ColHeader id="title" width="25%">
            Video Title
          </Table.ColHeader>
          <Table.ColHeader id="filename" width="35%">
            Filename
          </Table.ColHeader>
          <Table.ColHeader id="startDate" width="10%">
            Start Date
          </Table.ColHeader>
          <Table.ColHeader id="stopDate" width="10%">
            Stop Date
          </Table.ColHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {listings.map(listing => (
          <Table.Row key={listing.filename}>
            <Table.Cell>{listing.term}</Table.Cell>
            <Table.Cell>{listing.srs}</Table.Cell>
            <Table.Cell>{listing.videoTitle}</Table.Cell>
            <Table.Cell>
              <Text wrap="break-word">{listing.filename}</Text>
            </Table.Cell>
            <Table.Cell>{listing.startDate}</Table.Cell>
            <Table.Cell>{listing.stopDate}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
