import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { View } from '@instructure/ui-view';
import { Flex } from '@instructure/ui-flex';
import { SimpleSelect } from '@instructure/ui-simple-select';

import { AdminListingsToggle } from './AdminListingsToggle';
import { getLtik } from '../../services/ltik';

axiosRetry(axios);

const constants = require('../../../../constants');

export const AdminListings = ({ mediaType, setError }) => {
  AdminListings.propTypes = {
    mediaType: PropTypes.number,
    setError: PropTypes.func,
  };

  // Holds all media listings; set once
  const [mediaListings, setMediaListings] = useState([]);

  // Holds listings filtered based on term and subject area; set each time a filter changes
  const [filteredMediaListings, setFilteredMediaListings] = useState([]);

  // Holds all available academic terms for this mediaType; set once
  const [academicTerms, setAcademicTerms] = useState([]);

  // Holds all available subject areas; set each time the academic term changes
  const [subjectAreas, setSubjectAreas] = useState([]);

  // Holds filter selections
  const [selectedAcademicTerm, setSelectedAcademicTerm] = useState('');
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');

  const handleTermSelect = (event, { value }) => {
    setSelectedAcademicTerm(value);

    // If Term is not changed to All, then reset Subject Area to All
    // This is because the newly selected Term may not have media for that Subject Area
    if (value !== '') setSelectedSubjectArea('');
  };

  const handleSubjectSelect = (event, { value }) => {
    setSelectedSubjectArea(value);
  };

  // Retrieves all academic terms for this media type; called once
  const retrieveTerms = () => {
    const ltik = getLtik();
    axios
      .get(`${process.env.LTI_APPROUTE}/api/medias/terms?ltik=${ltik}`, {
        params: { mediaType },
      })
      .then((res) => {
        setAcademicTerms(res.data);
        setError(null);
      })
      .catch((err) => {
        setError({
          err,
          msg: `Something went wrong when retrieving academic terms...`,
        });
      });
  };
  // Loads term listing (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveTerms, []);

  // Retrieves all media listings, unfiltered; called once
  const retrieveListings = () => {
    const ltik = getLtik();
    axios
      .get(
        `${process.env.LTI_APPROUTE}/api/medias/${
          constants.mediaTypeMap.get(mediaType).api
        }/alllistings?ltik=${ltik}`
      )
      .then((res) => {
        setMediaListings(res.data);
        setFilteredMediaListings(res.data);
        setError(null);
      })
      .catch((err) => {
        const mediaTypeStr = constants.mediaTypeMap.get(mediaType).string;
        setError({
          err,
          msg: `Something went wrong when retrieving ${mediaTypeStr} listings...`,
        });
      });
  };
  // Loads media listing (only load once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveListings, []);

  // React effect to set filteredMediaListings; called if academic term or subject area filter changes
  const filterListings = () => {
    setFilteredMediaListings(
      mediaListings
        .filter((courseMediaGroup) => {
          if (selectedAcademicTerm === '') return courseMediaGroup;
          return courseMediaGroup._id.term === selectedAcademicTerm;
        })
        .filter((courseMediaGroup) => {
          if (selectedSubjectArea === '') return courseMediaGroup;
          return courseMediaGroup.subjectArea === selectedSubjectArea;
        })
    );
  };
  // Filters media listing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(filterListings, [selectedAcademicTerm, selectedSubjectArea]);

  // Retrieves subject areas for this mediaType and selected academic term; called each term filter updates
  const retrieveSubjectAreas = () => {
    const ltik = getLtik();
    axios
      .get(`${process.env.LTI_APPROUTE}/api/medias/subjectareas?ltik=${ltik}`, {
        params: { mediaType, term: selectedAcademicTerm },
      })
      .then((res) => {
        setSubjectAreas(res.data);
        setError(null);
      })
      .catch((err) => {
        setError({
          err,
          msg: 'Something went wrong when retrieving subject areas...',
        });
      });
  };
  // Loads subject area listing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(retrieveSubjectAreas, [selectedAcademicTerm]);

  return (
    <>
      <Flex>
        <Flex.Item padding="small">
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
            {academicTerms.map((term) => (
              <SimpleSelect.Option key={term} id={term} value={term}>
                {term}
              </SimpleSelect.Option>
            ))}
          </SimpleSelect>
        </Flex.Item>
        <Flex.Item padding="small">
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
              .filter((subjArea) => subjArea !== null)
              .map((subjArea) => (
                <SimpleSelect.Option
                  key={subjArea}
                  id={subjArea}
                  value={subjArea}
                >
                  {subjArea}
                </SimpleSelect.Option>
              ))}
          </SimpleSelect>
        </Flex.Item>
      </Flex>
      <br />
      <View>
        {filteredMediaListings.map((course) => (
          <AdminListingsToggle
            key={`${course._id.term}_${course._id.shortname}`}
            shortname={course._id.shortname}
            term={course._id.term}
            listings={course.listings}
            mediaType={mediaType}
          />
        ))}
      </View>
    </>
  );
};
