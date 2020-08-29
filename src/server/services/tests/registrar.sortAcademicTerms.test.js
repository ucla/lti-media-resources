import registrar from '../registrar';

test('Test sortAcademicTerms', done => {
  const unsortedTerms = [
    '8W',
    '91',
    '9F',
    '9S',
    '191',
    '19F',
    '19S',
    '19W',
    '201',
    '20F',
    '20S',
    '20W',
  ];

  const expectedSortedTerms = [
    '8W',
    '9S',
    '91',
    '9F',
    '19W',
    '19S',
    '191',
    '19F',
    '20W',
    '20S',
    '201',
    '20F',
  ];

  const sortedTerms = registrar.sortAcademicTerms(unsortedTerms);
  expect(sortedTerms).toEqual(expectedSortedTerms);

  const sortedTermsDescending = registrar.sortAcademicTerms(
    unsortedTerms,
    true
  );
  expect(sortedTermsDescending).toEqual(expectedSortedTerms.reverse());

  done();
});
