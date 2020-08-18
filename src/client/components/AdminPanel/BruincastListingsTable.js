import React from 'react';
import PropTypes from 'prop-types';

import { Text } from '@instructure/ui-text';
import { Table } from '@instructure/ui-table';

import { Comment } from '../Comment';

export const BruincastListingsTable = ({ shortname, listings }) => {
  BruincastListingsTable.propTypes = {
    shortname: PropTypes.string,
    listings: PropTypes.array,
  };

  return (
    <Table
      id={`table${shortname}`}
      hover
      layout="fixed"
      caption={`Bruincast listings for ${shortname}`}
    >
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="term" width="5%">
            Term
          </Table.ColHeader>
          <Table.ColHeader id="classID" width="15%">
            Class ID
          </Table.ColHeader>
          <Table.ColHeader id="week" width="5%">
            Week
          </Table.ColHeader>
          <Table.ColHeader id="date" width="10%">
            Date
          </Table.ColHeader>
          <Table.ColHeader id="filename" width="20%">
            Filename
          </Table.ColHeader>
          <Table.ColHeader id="type" width="10%">
            Type
          </Table.ColHeader>
          <Table.ColHeader id="title" width="15%">
            Title
          </Table.ColHeader>
          <Table.ColHeader id="comments" width="20%">
            Comments
          </Table.ColHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {listings.map(listing => (
          <Table.Row key={listing.filename}>
            <Table.Cell>{listing.term}</Table.Cell>
            <Table.Cell>{listing.classID}</Table.Cell>
            <Table.Cell>{listing.week}</Table.Cell>
            <Table.Cell>{listing.date}</Table.Cell>
            <Table.Cell>
              <Text wrap="break-word">{listing.filename}</Text>
            </Table.Cell>
            <Table.Cell>{listing.type}</Table.Cell>
            <Table.Cell>{listing.title}</Table.Cell>
            <Table.Cell>
              <Comment commentText={listing.comments} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
