const { compareAcademicTerms } = require('../utility');

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
    '211',
    '21F',
    '21S',
    '21W',
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
    '21W',
    '21S',
    '211',
    '21F',
  ];

  unsortedTerms.sort(compareAcademicTerms);
  expect(unsortedTerms).toEqual(expectedSortedTerms);
  done();
});
