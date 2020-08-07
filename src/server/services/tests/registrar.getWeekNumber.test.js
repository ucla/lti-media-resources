import registrar from '../registrar';

const cache = require('../cache');

it('Returns correct week number', async () => {
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
