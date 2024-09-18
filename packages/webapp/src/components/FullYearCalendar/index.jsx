import React, { useMemo, useState } from 'react';
import Calendar from 'rc-year-calendar';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Semibold } from '../Typography';
import YearSelectorModal from '../Modals/YearSelectorModal';
import { getNewDate } from '../Form/InputDuration/utils';
import.meta.glob('/node_modules/rc-year-calendar/locales/*.js', { eager: true });

function FullYearCalendarView({
  seed_date,
  germination_date,
  harvest_date,
  transplant_date,
  termination_date,
  plant_date,
  initial,
  language,
}) {
  const { t } = useTranslation();
  const [customYearSelected, setCustomYear] = useState(null);
  const [isYearSelectorActive, setYearSelectorOpened] = useState(false);

  const stagesDates = {
    seed_date,
    germination_date,
    harvest_date,
    transplant_date,
    termination_date,
    plant_date,
  };

  const initDate = getNewDate(stagesDates[initial]);
  const endDate = getNewDate(
    harvest_date || termination_date || transplant_date || germination_date,
  );

  const initYear = initDate.getFullYear();
  const endYear = endDate.getFullYear();

  const dateKeys = useMemo(
    () =>
      [
        'seed_date',
        'plant_date',
        'germination_date',
        'transplant_date',
        'harvest_date',
        'termination_date',
      ].filter((dateKey) => stagesDates[dateKey] !== undefined),
    [seed_date, germination_date, harvest_date, transplant_date, termination_date, plant_date],
  );

  const stageToColor = {
    seed_date: '#89D1C7',
    plant_date: '#037A0F',
    germination_date: '#AA5F04',
    harvest_date: '#8F26F0',
    transplant_date: '#0669E1',
    termination_date: '#D02620',
  };
  const stageToTranslation = {
    seed_date: t('CROP_MANAGEMENT.SEED'),
    plant_date: t('CROP_MANAGEMENT.PLANT'),
    germination_date: t('CROP_MANAGEMENT.GERMINATE'),
    harvest_date: t('CROP_MANAGEMENT.HARVEST'),
    transplant_date: t('CROP_MANAGEMENT.TRANSPLANT'),
    termination_date: t('CROP_MANAGEMENT.TERMINATE'),
  };
  const dataSource = [
    {
      id: 0,
      name: '',
      startDate: initDate,
      endDate: endDate,
      color: 'rgba(62, 169, 146, 0.3)',
    },
    ...dateKeys.map((k, i) => ({
      id: i + 1,
      name: k,
      startDate: getNewDate(stagesDates[k]),
      endDate: getNewDate(stagesDates[k]),
      color: stageToColor[k],
    })),
  ];

  const yearSelectorToggle = (toggle) => {
    setYearSelectorOpened(toggle);
  };

  const customYearSelector = (year) => {
    if (initYear === year) {
      setCustomYear(null);
    } else {
      setCustomYear(year);
    }
    setYearSelectorOpened(false);
  };

  return (
    <>
      <div className={styles.stagesBox}>
        {dateKeys.map((stageKey) => (
          <div className={styles.flexStage} key={stageKey}>
            <div className={styles.colorBox} style={{ backgroundColor: stageToColor[stageKey] }} />
            <div style={{ width: '100%', textAlign: 'center' }}>
              <span className={styles.colorBoxFont}>{stageToTranslation[stageKey]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.calendarBox}>
        {!!customYearSelected && (
          <>
            <div className={styles.yearBox} onClick={() => yearSelectorToggle(true)}>
              <Semibold style={{ color: 'var(--teal700)', textAlign: 'center' }}>
                {customYearSelected}{' '}
              </Semibold>
            </div>
            <Calendar
              dataSource={dataSource}
              year={customYearSelected}
              displayHeader={false}
              language={language}
            />
          </>
        )}
        {!customYearSelected && (
          <>
            <div className={styles.yearBox} onClick={() => yearSelectorToggle(true)}>
              <Semibold style={{ color: 'var(--teal700)', textAlign: 'center' }}>
                {initYear}{' '}
              </Semibold>
            </div>
            <Calendar
              dataSource={dataSource}
              year={initYear}
              displayHeader={false}
              language={language}
            />
            {initYear !== endYear && !isNaN(endYear) && (
              <>
                <div className={styles.yearBox}>
                  <Semibold style={{ color: 'var(--teal700)', textAlign: 'center' }}>
                    {endYear}{' '}
                  </Semibold>
                </div>
                <Calendar
                  dataSource={dataSource}
                  year={endYear}
                  displayHeader={false}
                  language={language}
                />
              </>
            )}
          </>
        )}
        <YearSelectorModal
          isOpen={isYearSelectorActive}
          dismissModal={() => yearSelectorToggle(false)}
          initYear={initYear}
          selectYear={customYearSelector}
        />
      </div>
    </>
  );
}

FullYearCalendarView.prototype = {
  seed_date: PropTypes.string.isRequired,
  germination_date: PropTypes.string,
  harvest_date: PropTypes.string,
  transplant_date: PropTypes.string,
  termination_date: PropTypes.string,
  plant_date: PropTypes.string,
  initial: PropTypes.oneOf([
    'seed_date',
    'germination_date',
    'harvest_date',
    'transplant_date',
    'termination_date',
    'plant_date',
  ]),
};

export default FullYearCalendarView;
