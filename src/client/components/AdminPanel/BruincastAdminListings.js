import React, { useState, useEffect } from 'react';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { Grid } from '@instructure/ui-grid';
import { TextInput } from '@instructure/ui-text-input';
import { ScreenReaderContent } from '@instructure/ui-a11y-content';
import { Alert } from '@instructure/ui-alerts';
import axios from 'axios';

import { BruincastAdminListingsToggle } from './BruincastAdminListingsToggle';
import { ltikPromise } from '../../services/ltik';

export const BruincastAdminListings = () => {
  // Variable for searchTerm, updated directly by term field change
  const [searchTerm, setSearchTerm] = useState('');

  // Variable updated only when user actually hits Go
  // Used to display warning when response has no items. Using searchTerm dynamically updates the variable text, potentially confusing the user.
  const [recentlySearchedTerm, setRecentlySearchedTerm] = useState('');

  // Array to hold response for returned media listings
  const [mediaListings, setMediaListings] = useState([]);

  const handleTermInput = event => {
    setSearchTerm(event.target.value);
  };

  const retrieveCastListings = () => {
    setRecentlySearchedTerm(searchTerm);
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/bruincast/castlistings?ltik=${ltik}`, {
          params: { term: searchTerm },
        })
        .then(res => setMediaListings(res.data));
    });
  };
  useEffect(retrieveCastListings, []);

  const handleListingsSearch = event => {
    retrieveCastListings();
    event.preventDefault();
  };

  return (
    <View>
      <form name="listingsSearch" onSubmit={handleListingsSearch}>
        <Grid
          startAt="medium"
          vAlign="middle"
          colSpacing="none"
          rowSpacing="small"
        >
          <Grid.Row>
            <Grid.Col>
              <div>
                <Text>
                  <strong>Term</strong> (leave empty to show content from all
                  terms)
                </Text>
                &nbsp;
                <TextInput
                  renderLabel={
                    <ScreenReaderContent>
                      Academic term text field
                    </ScreenReaderContent>
                  }
                  display="inline-block"
                  width="5rem"
                  onChange={handleTermInput}
                />
              </div>
            </Grid.Col>
          </Grid.Row>
          <Grid.Row key="gobutton">
            <Grid.Col key="button" width="auto">
              <Button color="primary" onClick={handleListingsSearch}>
                Go
              </Button>
            </Grid.Col>
          </Grid.Row>
        </Grid>
      </form>
      <br />
      <View>
        {mediaListings.length === 0 && recentlySearchedTerm !== '' && (
          <Alert variant="warning" margin="small">
            {`No Bruincast content found for ${recentlySearchedTerm}.`}
          </Alert>
        )}
        {mediaListings.map(course => (
          <BruincastAdminListingsToggle
            key={course.courseShortname}
            shortname={course.courseShortname}
            term={course.courseTerm}
            listings={course.courseListings}
          />
        ))}
      </View>
    </View>
  );
};
