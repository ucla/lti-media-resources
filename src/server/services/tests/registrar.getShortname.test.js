import registrar from '../registrar';

require('dotenv').config();

it('returns basic shortname', async () => {
  registrar.call = jest.fn().mockResolvedValue({
    courseClassIdentifiers: [
      {
        offeredTermCode: '20S',
        classSectionID: '318001200',
        courseClassIdentifierCollection: [
          {
            subjectAreaCode: 'PHYSICS',
            courseCatalogNumber: '0001A',
            courseStartTermCode: '20W',
            classNumber: '001',
            classSectionNumber: '001',
          },
        ],
      },
    ],
  });

  const shortname = await registrar.getShortname('20S', '318001200');
  expect(shortname).toEqual('20S-PHYSICS1A-1');
});

it('returns complex shortname', async () => {
  registrar.call = jest.fn().mockResolvedValue({
    courseClassIdentifiers: [
      {
        offeredTermCode: '20S',
        classSectionID: '370705200',
        courseClassIdentifierCollection: [
          {
            subjectAreaCode: 'C&S BIO',
            courseCatalogNumber: '0150  M',
            courseStartTermCode: '20S',
            classNumber: '001',
            classSectionNumber: '001',
          },
        ],
      },
    ],
  });

  const shortname = await registrar.getShortname('20S', '370705200');
  expect(shortname).toEqual('20S-CSBIO150M-1');
});

it('returns summer shortnames', async () => {
  registrar.call = jest
    .fn()
    .mockImplementationOnce(() => ({
      courseClassIdentifiers: [
        {
          courseClassIdentifierCollection: [
            {
              subjectAreaCode: 'COM SCI',
              courseCatalogNumber: '0031',
              classNumber: '001',
              classSectionNumber: '001',
            },
          ],
        },
      ],
    }))
    .mockImplementationOnce(() => ({
      classes: [
        {
          offeredTermCode: '201',
          subjectAreaCode: 'COM SCI',
          courseCatalogNumber: '0031',
          termSessionGroupCollection: [
            {
              termsessionGroupCode: 'A',
              termsessionInstructionWeeks: '8',
            },
          ],
        },
      ],
    }));

  let shortname = await registrar.getShortname('201', '187093910');
  expect(shortname).toEqual('201A-COMSCI31-1');

  registrar.call = jest
    .fn()
    .mockImplementationOnce(() => ({
      courseClassIdentifiers: [
        {
          courseClassIdentifierCollection: [
            {
              subjectAreaCode: 'LIFESCI',
              courseCatalogNumber: '0030B',
              classNumber: '001',
              classSectionNumber: '001',
            },
          ],
        },
      ],
    }))
    .mockImplementationOnce(() => ({
      classes: [
        {
          termSessionGroupCollection: [
            {
              termsessionGroupCode: 'C',
              termsessionInstructionWeeks: '6',
            },
          ],
        },
      ],
    }));

  shortname = await registrar.getShortname('201', '252091930');
  expect(shortname).toEqual('201C-LIFESCI30B-1');
});
