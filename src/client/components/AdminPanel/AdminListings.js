import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { View } from '@instructure/ui-view';
import { Grid } from '@instructure/ui-grid';
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

  const [mediaListings, setMediaListings] = useState([]);
  const [filteredMediaListings, setFilteredMediaListings] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);

  const [selectedAcademicTerm, setSelectedAcademicTerm] = useState('');
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');

  const handleTermSelect = (event, { value }) => {
    setSelectedAcademicTerm(value);
    setSelectedSubjectArea('');
  };

  const handleSubjectSelect = (event, { value }) => {
    setSelectedSubjectArea(value);
  };

  const retrieveTerms = () => {
    const ltik = getLtik();
    axios
      .get(`/api/medias/bruincast/terms?ltik=${ltik}`)
      .then(res => {
        setAcademicTerms(res.data);
        setError(null);
      })
      .catch(err => {
        setError({
          err,
          msg: `Something went wrong when retrieving academic terms...`,
        });
      });
  };
  useEffect(retrieveTerms, []);

  const retrieveListings = () => {
    const ltik = getLtik();
    axios
      .get(
        `/api/medias/${
          constants.mediaTypeMap.get(mediaType).api
        }/alllistings?ltik=${ltik}`,
        {
          params: { term: selectedAcademicTerm },
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
  useEffect(retrieveListings, [selectedAcademicTerm]);

  const filterListings = () => {
    setFilteredMediaListings(
      mediaListings.filter(mediaGroup => {
        if (selectedSubjectArea === '') return mediaGroup;
        return mediaGroup.subjectArea === selectedSubjectArea;
      })
    );
  };
  useEffect(filterListings, [selectedSubjectArea]);

  const retrieveSubjectAreas = () => {
    const ltik = getLtik();
    axios
      .get(
        `/api/medias/${
          constants.mediaTypeMap.get(mediaType).api
        }/subjectareas?ltik=${ltik}`,
        {
          params: { term: selectedAcademicTerm },
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
  useEffect(retrieveSubjectAreas, [selectedAcademicTerm]);

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
            <SimpleSelect
              renderLabel="Term"
              value={selectedAcademicTerm}
              onChange={handleTermSelect}
              visibleOptionsCount={5}
              width="6rem"
            >
              <SimpleSelect.Option id="all" value="">
                All
              </SimpleSelect.Option>
              {academicTerms.map(term => (
                <SimpleSelect.Option key={term} id={term} value={term}>
                  {term}
                </SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </Grid.Col>
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
      <br />
      <View>
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
