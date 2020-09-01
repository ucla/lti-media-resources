import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { Grid } from '@instructure/ui-grid';
import { TextInput } from '@instructure/ui-text-input';
import { ScreenReaderContent } from '@instructure/ui-a11y-content';
import { Alert } from '@instructure/ui-alerts';
import { SimpleSelect } from '@instructure/ui-simple-select';
import axios from 'axios';

import axiosRetry from 'axios-retry';

import { AdminListingsToggle } from './AdminListingsToggle';
import { getLtik } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export const AdminListings = ({ mediaType, setError }) => {
  AdminListings.propTypes = {
    mediaType: PropTypes.number,
    setError: PropTypes.func,
  };

  // Variable for searchTerm, updated directly by term field change
  const [searchTerm, setSearchTerm] = useState('');

  // Variable updated only when user actually hits Go
  // Used to display warning when response has no items. Using searchTerm dynamically updates the variable text, potentially confusing the user.
  const [recentlySearchedTerm, setRecentlySearchedTerm] = useState('');

  // Array to hold response for returned media listings
  const [mediaListings, setMediaListings] = useState([]);
  const [filteredMediaListings, setFilteredMediaListings] = useState([]);

  const handleTermInput = event => {
    setSearchTerm(event.target.value);
  };

  const retrieveListings = () => {
    const ltik = getLtik();
    axios
      .get(
        `/api/medias/${
          constants.mediaTypeMap.get(mediaType).api
        }/alllistings?ltik=${ltik}`,
        {
          params: { term: recentlySearchedTerm },
        }
      )
      .then(res => {
        setMediaListings(res.data);
        setFilteredMediaListings(res.data);
        setError(null);
      })
      .catch(err => {
        const mediaTypeStr = constants.mediaTypeMap.get(mediaType).string;
        setError({
          err,
          msg: `Something went wrong when retrieving ${mediaTypeStr} listings...`,
        });
      });
  };
  useEffect(retrieveListings, [recentlySearchedTerm]);

  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
  const handleSubjectSelect = (event, { value }) => {
    setSelectedSubjectArea(value);
  };

  const filterListings = () => {
    setFilteredMediaListings(
      mediaListings.filter(mediaGroup => {
        if (selectedSubjectArea === '') return mediaGroup;
        return mediaGroup.subjectArea === selectedSubjectArea;
      })
    );
  };
  useEffect(filterListings, [selectedSubjectArea]);

  const [subjectAreas, setSubjectAreas] = useState([]);
  const retrieveSubjectAreas = () => {
    const ltik = getLtik();
    axios
      .get(
        `/api/medias/${
          constants.mediaTypeMap.get(mediaType).api
        }/subjectareas?ltik=${ltik}`,
        {
          params: { term: recentlySearchedTerm },
        }
      )
      .then(res => {
        setSubjectAreas(res.data);
        setError(null);
      })
      .catch(err => {
        setError({
          err,
          msg: 'Something went wrong when retrieving subject areas...',
        });
      });
  };
  useEffect(retrieveSubjectAreas, [recentlySearchedTerm]);

  const handleListingsSearch = event => {
    setRecentlySearchedTerm(searchTerm);
    setSelectedSubjectArea('');
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
                &nbsp;
                <Button color="primary" onClick={handleListingsSearch}>
                  Go
                </Button>
              </div>
            </Grid.Col>
          </Grid.Row>
          <Grid.Row>
            <Grid.Col>
              <SimpleSelect
                renderLabel="Subject Area"
                value={selectedSubjectArea}
                onChange={handleSubjectSelect}
                visibleOptionsCount={5}
                width="12rem"
              >
                <SimpleSelect.Option id="all" value="">
                  All
                </SimpleSelect.Option>
                {subjectAreas
                  .filter(subjArea => subjArea !== null)
                  .map(subjArea => (
                    <SimpleSelect.Option
                      key={subjArea}
                      id={subjArea}
                      value={subjArea}
                    >
                      {subjArea}
                    </SimpleSelect.Option>
                  ))}
              </SimpleSelect>
            </Grid.Col>
          </Grid.Row>
        </Grid>
      </form>
      <br />
      <View>
        {mediaListings.length === 0 && recentlySearchedTerm !== '' && (
          <Alert variant="warning">
            {`No ${
              constants.mediaTypeMap.get(mediaType).string
            } content found for ${recentlySearchedTerm}.`}
          </Alert>
        )}
        {filteredMediaListings.map(course => (
          <AdminListingsToggle
            key={course._id}
            shortname={course._id}
            listings={course.listings}
            mediaType={mediaType}
          />
        ))}
      </View>
    </View>
  );
};
