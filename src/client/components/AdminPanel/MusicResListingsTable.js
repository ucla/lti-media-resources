import React from 'react';
import PropTypes from 'prop-types';

import { Text } from '@instructure/ui-text';
import { Table } from '@instructure/ui-table';

export const MusicResListingsTable = ({ items, term, classID, albumTitle }) => {
  MusicResListingsTable.propTypes = {
    items: PropTypes.array,
    term: PropTypes.string,
    classID: PropTypes.string,
    albumTitle: PropTypes.string,
  };

  return (
    <Table
      id={`table${albumTitle}`}
      hover
      layout="fixed"
      caption={`Music Reserves listing: ${albumTitle}`}
    >
      <Table.Head>
        <Table.Row>
          <Table.ColHeader id="term" width="5%">
            Term
          </Table.ColHeader>
          <Table.ColHeader id="classID" width="15%">
            Class ID
          </Table.ColHeader>
          <Table.ColHeader id="title" width="20%">
            Track Title
          </Table.ColHeader>
          <Table.ColHeader id="volume" width="5%">
            Vol.
          </Table.ColHeader>
          <Table.ColHeader id="disc" width="5%">
            Disc
          </Table.ColHeader>
          <Table.ColHeader id="side" width="5%">
            Side
          </Table.ColHeader>
          <Table.ColHeader id="trackNum" width="5%">
            Track #
          </Table.ColHeader>
          <Table.ColHeader id="filename" width="30%">
            URL
          </Table.ColHeader>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.httpURL}>
            <Table.Cell>{term}</Table.Cell>
            <Table.Cell>{classID}</Table.Cell>
            <Table.Cell>{item.trackTitle}</Table.Cell>
            <Table.Cell>{item.volume}</Table.Cell>
            <Table.Cell>{item.disc}</Table.Cell>
            <Table.Cell>{item.side}</Table.Cell>
            <Table.Cell>{item.trackNumber}</Table.Cell>
            <Table.Cell>
              <Text wrap="break-word">{item.httpURL}</Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
