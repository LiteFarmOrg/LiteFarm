import React from 'react';
import utils from './utils';
import PropTypes from 'prop-types';
import styles from './assets/styles.scss';
import clsx from 'clsx';

const propTypes = {
  todayData: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

const TodayForecast = (props) => {
  const { todayData, unit, lang } = props;
  const todayIcon = utils.getIcon(todayData.icon);
  const units = utils.getUnits(unit);
  const langs = utils.getLangs(lang);
  return (
    <div className={styles.today}>
      <div className={styles.date}>{todayData.date}</div>
      <div className={styles.hr} />
      <div className={styles.current}>
        {todayData.temperature.current} {units.temp}
      </div>
      <div className={styles.range}>
        {todayData.temperature.max} / {todayData.temperature.min} {units.temp}
      </div>
      <div className={styles.desc}>
        <i className={clsx(styles.wicon, 'wi', todayIcon)} />
        &nbsp;{todayData.description}
      </div>
      <div className={styles.hr} />
      <div className={styles.info}>
        <div>
          {langs.Wind}: <b>{todayData.wind}</b> {units.speed}
        </div>
        <div>
          {langs.Humidity}: <b>{todayData.humidity}</b> %
        </div>
      </div>
    </div>
  );
};

TodayForecast.propTypes = propTypes;

export default TodayForecast;
