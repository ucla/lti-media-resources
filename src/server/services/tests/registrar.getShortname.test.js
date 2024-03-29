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

  const { shortname } = await registrar.getShortname('20S', '318001200');
  expect(shortname).toEqual('20S-PHYSICS-0001A-001');
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

  const { shortname } = await registrar.getShortname('20S', '370705200');
  expect(shortname).toEqual('20S-C&S BIO-0150  M-001');
});

it('returns summer shortnames', async () => {
  // Just one summer section.
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
              classCollection: [{ classNumber: '001' }],
            },
          ],
        },
      ],
    }));

  const { shortname: shortnameA } = await registrar.getShortname(
    '201',
    '187093910'
  );
  expect(shortnameA).toEqual('201A-COM SCI-0031-001');

  // Multiple summer sessions.
  registrar.call = jest
    .fn()
    .mockImplementationOnce(() => ({
      courseClassIdentifiers: [
        {
          courseClassIdentifierCollection: [
            {
              subjectAreaCode: 'LIFESCI',
              courseCatalogNumber: '0030B',
              classNumber: '002',
              classSectionNumber: '002',
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
              termsessionGroupCode: 'A',
              termsessionInstructionWeeks: '8',
              classCollection: [{ classNumber: '001' }],
            },
            {
              termsessionGroupCode: 'C',
              termsessionInstructionWeeks: '6',
              classCollection: [{ classNumber: '002' }],
            },
          ],
        },
      ],
    }));

  const { shortname: shortnameC } = await registrar.getShortname(
    '201',
    '252091930'
  );
  expect(shortnameC).toEqual('201C-LIFESCI-0030B-002');
});
