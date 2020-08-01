import React, { useState, useEffect } from 'react';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { Grid } from '@instructure/ui-grid';
import { TextInput } from '@instructure/ui-text-input';
import { ScreenReaderContent } from '@instructure/ui-a11y-content';
import axios from 'axios';

import { BruincastAdminListingsToggle } from './BruincastAdminListingsToggle';
import { ltikPromise } from '../../services/ltik';

export const BruincastAdminListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaListings, setMediaListings] = useState([]);

  const handleTermInput = event => {
    setSearchTerm(event.target.value);
  };

  const retrieveCastListings = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/bruincast/castlistings?ltik=${ltik}`, {
          params: { term: searchTerm },
        })
        .then(res => setMediaListings(res.data));
    });
  };
  useEffect(retrieveCastListings, []);

  const searchWithTerms = async () => {
    retrieveCastListings();
  };

  return (
    <View>
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
        <Grid.Row>
          <Grid.Col width="auto">
            <Button color="primary" onClick={searchWithTerms}>
              Go
            </Button>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <br />
      <View>
        {mediaListings.map(course => (
          <View>
            <BruincastAdminListingsToggle
              shortname={course.courseShortname}
              term={course.courseTerm}
              listings={course.courseListings}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
