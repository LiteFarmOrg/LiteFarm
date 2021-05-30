import React from 'react';
import Calendar from 'rc-year-calendar';
import styles from './styles.module.scss';
import { useTranslation } from "react-i18next";

function FullYearCalendarView({ stages }) {
  const { t } = useTranslation();
  const { seed, ...durations } = stages;
  const initDate = seed;
  const endDate = calculateFinishDate(initDate, Object.values(durations));
  const { accumDays, ...stagesDates } = Object.keys(durations).reduce((obj, k) => {
    return {
      ...obj,
      accumDays: obj.accumDays + durations[k],
      [k]: calculateFinishDate(initDate, [ obj.accumDays + durations[k] ],)
    }
  }, { accumDays: 0 })
  const stageToColor = {
    seed: '#037A0F',
    germinate: '#AA5F04',
    harvest: '#8F26F0',
    transplant: '#0669E1',
    terminate: 'D02620'
  }
  const stageToTranslation = {
    // seed: t('CROP_MANAGEMENT.SEED'),
    seed: 'Seed',
    germinate: 'Germinate',
    // germinate: t('CROP_MANAGEMENT.GERMINATE'),
    harvest: 'Harvest',
    // harvest: t('CROP_MANAGEMENT.HARVEST'),
    transplant: t('CROP_MANAGEMENT.TRANSPLANT'),
    terminate: t('CROP_MANAGEMENT.TERMINATE')
  }
  const dataSource = [ {
    id: 0,
    name: '',
    startDate: initDate,
    endDate: initDate,
    color: stageToColor.seed
  }, {
    id: 1,
    name: '',
    startDate: initDate,
    endDate: endDate,
    color: 'rgba(62, 169, 146, 0.3)'
  },
  ].concat(
    Object.keys(stagesDates).map((k, i) => ({
      id: i + 2,
      name: k,
      startDate: stagesDates[k],
      endDate: stagesDates[k],
      color: stageToColor[k]
    })))
  return (
    <div style={{ pointerEvents: 'none' }}>
      <div className={styles.stagesBox}>
        {Object.keys(stages).map((stageKey) => (
          <div className={styles.flexStage}>
            <div className={styles.colorBox}
                 style={{ backgroundColor: stageToColor[stageKey], display: 'inline-block' }}/>
            <span className={styles.colorBoxFont}>{stageToTranslation[stageKey]}</span>
          </div>
        ))}
      </div>
      <Calendar dataSource={dataSource}/>
    </div>
  )
}

function calculateFinishDate(initialDay, arrayOfDurations) {
  const days = arrayOfDurations.reduce((a, b) => a + b, 0);
  const date = new Date(initialDay);
  date.setDate(date.getDate() + days)
  return date;
}


export default FullYearCalendarView;