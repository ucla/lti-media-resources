import React from 'react';
import dompurify from 'dompurify';
import PropTypes from 'prop-types';

import { Text } from '@instructure/ui-text';
import { Table } from '@instructure/ui-table';
import { ToggleGroup } from '@instructure/ui-toggle-details';

const sanitizeComment = comment =>
  dompurify
    .sanitize(comment)
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/ ... /g, ' ')
    .replace(/&nbsp;/g, ' ');

export const BruinCastListingsToggle = ({ shortname, listings }) => {
  BruinCastListingsToggle.propTypes = {
    shortname: PropTypes.string,
    listings: PropTypes.array,
  };

  return (
    <ToggleGroup
      toggleLabel={`Listings for ${shortname}`}
      summary={`${shortname} · ${listings.length} listings`}
      background="default"
    >
      <Table hover layout="fixed">
        <Table.Head>
          <Table.Row>
            <Table.ColHeader id="term" width="5%">
              Term
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
            <Table.ColHeader id="classID" width="15%">
              Class ID
            </Table.ColHeader>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {listings.map(listing => (
            <Table.Row>
              <Table.Cell>{listing.term}</Table.Cell>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>{listing.date}</Table.Cell>
              <Table.Cell>
                <Text wrap="break-word">{listing.filename}</Text>
              </Table.Cell>
              <Table.Cell>{listing.type}</Table.Cell>
              <Table.Cell>{listing.title}</Table.Cell>
              <Table.Cell>
                <Text wrap="break-word">
                  {sanitizeComment(listing.comments)}
                </Text>
              </Table.Cell>
              <Table.Cell>{listing.classID}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </ToggleGroup>
  );
};
