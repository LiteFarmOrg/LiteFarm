import React from 'react';
import styles from './../FullYearCalendar/styles.module.scss';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Semibold } from '../Typography';
import clsx from 'clsx';
import { getNewDate } from '../Form/InputDuration/utils';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

function FullMonthCalendarView({ date, stage }) {
  const { t } = useTranslation();
  const stageToColor = {
    harvest_date: '#8F26F0',
    termination_date: '#D02620',
  };
  const stageToTranslation = {
    harvest_date: t('CROP_MANAGEMENT.HARVEST'),
    termination_date: t('CROP_MANAGEMENT.TERMINATE'),
  };
  const targetDate = getNewDate(date);
  const monthName = new Intl.DateTimeFormat(getLanguageFromLocalStorage(), {
    month: 'long',
  }).format(targetDate);
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const endDay = lastDayOfMonth.getDay();
  const numberOfDays = lastDayOfMonth.getDate() - firstDayOfMonth.getDate() + 1;
  const previousMonthDays = startDay;
  const nextMonthDays = 6 - endDay;
  return (
    <>
      <div className={styles.stagesBox}>
        <div className={styles.flexStage}>
          <div className={styles.colorBox} style={{ backgroundColor: stageToColor[stage] }} />
          <div style={{ width: '100%', textAlign: 'center' }}>
            <span className={styles.colorBoxFont}>{stageToTranslation[stage]}</span>
          </div>
        </div>
      </div>
      <div className={styles.calendarBox}>
        <>
          <div className={styles.monthBox}>
            <Semibold style={{ color: 'var(--teal700)', textAlign: 'center' }}>
              {monthName} {targetDate.getFullYear()}
            </Semibold>
          </div>
        </>
        <div
          style={{
            display: ' flex',
            flexDirection: 'column',
            paddingLeft: '20px',
            paddingBottom: '20px',
          }}
        >
          <div
            style={{
              flex: '1',
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
            }}
          >
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>S</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>M</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>T</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>W</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>T</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>F</b>
            </div>
            <div style={{ flex: '1 0 13%', alignSelf: 'center' }}>
              <b>S</b>
            </div>
          </div>
          <div
            style={{
              flex: '1',
              marginTop: '5px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-evenly',
            }}
          >
            {[...Array(previousMonthDays)].map((_, index) => (
              <div
                key={index}
                style={{ flex: '1 0 13%', marginTop: '10px', alignSelf: 'center' }}
              />
            ))}
            {[...Array(numberOfDays)].map((_, dayNumber) => (
              <div
                key={dayNumber}
                style={{ flex: '1 0 13%', marginTop: '10px', alignSelf: 'center' }}
              >
                <span
                  style={{
                    backgroundColor: dayNumber + 1 === targetDate.getDate() && stageToColor[stage],
                  }}
                  className={clsx(dayNumber + 1 === targetDate.getDate() && styles.targetDateFont)}
                >
                  {dayNumber + 1}
                </span>
              </div>
            ))}
            {[...Array(nextMonthDays)].map((_, index) => (
              <div
                key={index}
                style={{ flex: '1 0 13%', marginTop: '10px', alignSelf: 'center' }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

FullMonthCalendarView.prototype = {
  seed_date: PropTypes.string.isRequired,
  germination_date: PropTypes.string,
  harvest_date: PropTypes.string,
  transplant_date: PropTypes.string,
  termination_date: PropTypes.string,
};

export default FullMonthCalendarView;
