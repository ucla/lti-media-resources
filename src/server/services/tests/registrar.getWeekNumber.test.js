import registrar from '../registrar';

const cache = require('../cache');

it('Correct week numbers for regular term 20S', async () => {
  cache.set(`TermSessionsByWeek_20S`, {
    termSessionsByWeek: [
      {
        sessionTermCode: '20S',
        termSessionCollection: [
          {
            sessionCode: 'RG',
            sessionWeekNumber: '0',
            sessionWeekStartDate: '2020-03-21',
            sessionWeekLastDate: '2020-03-27',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '1',
            sessionWeekStartDate: '2020-03-28',
            sessionWeekLastDate: '2020-04-03',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '2',
            sessionWeekStartDate: '2020-04-04',
            sessionWeekLastDate: '2020-04-10',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '3',
            sessionWeekStartDate: '2020-04-11',
            sessionWeekLastDate: '2020-04-17',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '4',
            sessionWeekStartDate: '2020-04-18',
            sessionWeekLastDate: '2020-04-24',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '5',
            sessionWeekStartDate: '2020-04-25',
            sessionWeekLastDate: '2020-05-01',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '6',
            sessionWeekStartDate: '2020-05-02',
            sessionWeekLastDate: '2020-05-08',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '7',
            sessionWeekStartDate: '2020-05-09',
            sessionWeekLastDate: '2020-05-15',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '8',
            sessionWeekStartDate: '2020-05-16',
            sessionWeekLastDate: '2020-05-22',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '9',
            sessionWeekStartDate: '2020-05-23',
            sessionWeekLastDate: '2020-05-29',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '10',
            sessionWeekStartDate: '2020-05-30',
            sessionWeekLastDate: '2020-06-05',
          },
          {
            sessionCode: 'RG',
            sessionWeekNumber: '88',
            sessionWeekStartDate: '2020-06-06',
            sessionWeekLastDate: '2020-06-12',
          },
        ],
      },
    ],
  });

  const responseForApril7 = await registrar.getWeekNumber('20S', '04/07/2020');
  expect(responseForApril7).toEqual(2);

  const responseForMay22 = await registrar.getWeekNumber('20S', '05/22/2020');
  expect(responseForMay22).toEqual(8);

  const responseForMay23 = await registrar.getWeekNumber('20S', '05/23/2020');
  expect(responseForMay23).toEqual(9);

  const responseForJune5 = await registrar.getWeekNumber('20S', '06/05/2020');
  expect(responseForJune5).toEqual(10);

  const responseForJune12 = await registrar.getWeekNumber('20S', '06/12/2020');
  expect(responseForJune12).toEqual(88);

  const responseForJuly22 = await registrar.getWeekNumber('20S', '07/22/2020');
  expect(responseForJuly22).toEqual(null);
});

it('Correct week numbers for summer session terms 201A, 201C', async () => {
  cache.set(`TermSessionsByWeek_201A`, {
    termSessionsByWeek: [
      {
        sessionTermCode: '201',
        termSessionCollection: [
          {
            sessionCode: '1A',
            sessionWeekNumber: '1',
            sessionWeekStartDate: '2020-06-20',
            sessionWeekLastDate: '2020-06-26',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '2',
            sessionWeekStartDate: '2020-06-27',
            sessionWeekLastDate: '2020-07-03',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '3',
            sessionWeekStartDate: '2020-07-04',
            sessionWeekLastDate: '2020-07-10',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '4',
            sessionWeekStartDate: '2020-07-11',
            sessionWeekLastDate: '2020-07-17',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '5',
            sessionWeekStartDate: '2020-07-18',
            sessionWeekLastDate: '2020-07-24',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '6',
            sessionWeekStartDate: '2020-07-25',
            sessionWeekLastDate: '2020-07-31',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '7',
            sessionWeekStartDate: '2020-08-01',
            sessionWeekLastDate: '2020-08-07',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '8',
            sessionWeekStartDate: '2020-08-08',
            sessionWeekLastDate: '2020-08-14',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '9',
            sessionWeekStartDate: '2020-08-15',
            sessionWeekLastDate: '2020-08-21',
          },
          {
            sessionCode: '1A',
            sessionWeekNumber: '10',
            sessionWeekStartDate: '2020-08-22',
            sessionWeekLastDate: '2020-08-28',
          },
        ],
      },
    ],
  });

  cache.set(`TermSessionsByWeek_201C`, {
    termSessionsByWeek: [
      {
        sessionTermCode: '201',
        termSessionCollection: [
          {
            sessionCode: '6C',
            sessionWeekNumber: '1',
            sessionWeekStartDate: '2020-08-01',
            sessionWeekLastDate: '2020-08-07',
          },
          {
            sessionCode: '6C',
            sessionWeekNumber: '2',
            sessionWeekStartDate: '2020-08-08',
            sessionWeekLastDate: '2020-08-14',
          },
          {
            sessionCode: '6C',
            sessionWeekNumber: '3',
            sessionWeekStartDate: '2020-08-15',
            sessionWeekLastDate: '2020-08-21',
          },
          {
            sessionCode: '6C',
            sessionWeekNumber: '4',
            sessionWeekStartDate: '2020-08-22',
            sessionWeekLastDate: '2020-08-28',
          },
          {
            sessionCode: '6C',
            sessionWeekNumber: '5',
            sessionWeekStartDate: '2020-08-29',
            sessionWeekLastDate: '2020-09-04',
          },
          {
            sessionCode: '6C',
            sessionWeekNumber: '6',
            sessionWeekStartDate: '2020-09-05',
            sessionWeekLastDate: '2020-09-11',
          },
        ],
      },
    ],
  });

  const responseForMay22A = await registrar.getWeekNumber('201A', '05/22/2020');
  expect(responseForMay22A).toEqual(null);

  const responseForJun20A = await registrar.getWeekNumber('201A', '06/20/2020');
  expect(responseForJun20A).toEqual(1);

  const responseForJul31A = await registrar.getWeekNumber('201A', '07/31/2020');
  expect(responseForJul31A).toEqual(6);

  const responseForJul31C = await registrar.getWeekNumber('201C', '07/31/2020');
  expect(responseForJul31C).toEqual(null);

  const responseForAug1A = await registrar.getWeekNumber('201A', '08/01/2020');
  expect(responseForAug1A).toEqual(7);

  const responseForAug1C = await registrar.getWeekNumber('201C', '08/01/2020');
  expect(responseForAug1C).toEqual(1);

  const responseForAug28A = await registrar.getWeekNumber('201A', '08/28/2020');
  expect(responseForAug28A).toEqual(10);

  const responseForAug28C = await registrar.getWeekNumber('201C', '08/28/2020');
  expect(responseForAug28C).toEqual(4);

  const responseForAug29A = await registrar.getWeekNumber('201A', '08/29/2020');
  expect(responseForAug29A).toEqual(null);

  const responseForSept9C = await registrar.getWeekNumber('201C', '09/09/2020');
  expect(responseForSept9C).toEqual(6);
});
