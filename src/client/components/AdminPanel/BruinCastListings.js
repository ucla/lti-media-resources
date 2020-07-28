import React, { useState, useEffect } from 'react';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { Grid } from '@instructure/ui-grid';
import { TextInput } from '@instructure/ui-text-input';
import { ScreenReaderContent } from '@instructure/ui-a11y-content';
import axios from 'axios';

import { BruinCastListingsToggle } from './BruinCastListingsToggle';
import { ltikPromise } from '../../services/ltik';

export const BruinCastListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaListings, setMediaListings] = useState([]);

  console.log(mediaListings);

  const handleTermInput = event => {
    setSearchTerm(event.target.value);
  };

  const retrieveAllBruinCasts = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/bruincast/allcasts?ltik=${ltik}`)
        .then(res => setMediaListings(res.data));
    });
  };
  useEffect(retrieveAllBruinCasts, []);

  const retrieveBruinCastsWithSearchTerms = () => {
    ltikPromise.then(ltik => {
      axios
        .get(`/api/medias/bruincast/castsbyterm?ltik=${ltik}`, {
          params: { term: searchTerm },
        })
        .then(res => setMediaListings(res.data));
    });
  };
  useEffect(retrieveBruinCastsWithSearchTerms, []);

  const searchWithTerms = async () => {
    console.log(`searchTerm: ${searchTerm}`);
    if (searchTerm === '') {
      retrieveAllBruinCasts();
    } else {
      retrieveBruinCastsWithSearchTerms();
    }
    console.log(mediaListings);
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
          <Grid.Col>
            <div>
              <Text>
                <strong>Subject area</strong>
              </Text>
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
            <BruinCastListingsToggle
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
