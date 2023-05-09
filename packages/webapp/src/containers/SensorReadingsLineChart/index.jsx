import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSensorReadingsLineChart } from './useSensorReadingsLineChart';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Spinner from '../../components/Spinner';
import { Semibold } from '../../components/Typography';

const SensorReadingsLineChart = ({ readingType, noDataFoundMessage }) => {
  const dispatch = useDispatch();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };

  const { loading = true, chartLabels, chartData } = useSensorReadingsLineChart(readingType);

  return (
    <>
      {loading && (
        <div className={styles.loaderWrapper}>
          <Spinner />
        </div>
      )}
      {!chartData?.sensorsReadings?.length && (
        <>
          <div className={styles.titleWrapper}>
            <label>
              <Semibold className={styles.title}>{chartLabels.title}</Semibold>
            </label>
          </div>
          <div className={styles.emptyRect}>
            <label className={styles.emptyRectMessasge}>{noDataFoundMessage}</label>
          </div>
        </>
      )}
      {chartData?.sensorsReadings?.length && chartLabels && (
        <PureSensorReadingsLineChart
          showSpotLight={!sensor_reading_chart}
          resetSpotlight={resetSpotlight}
          labels={chartLabels}
          data={chartData}
        />
      )}
    </>
  );
};

SensorReadingsLineChart.propTypes = {
  readingType: PropTypes.string.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
