import React from 'react';
import PropTypes from 'prop-types';
import { useSensorReadingsLineChart } from './useSensorReadingsLineChart';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Spinner from '../../components/Spinner';
import { Semibold } from '../../components/Typography';

const SensorReadingsLineChart = ({ readingType = '', noDataFoundMessage = '' }) => {
  const dispatch = useDispatch();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };
  const {
    sensorsReadings = [],
    yAxisDataKeys = [],
    lineColors = [],
    loading = true,
    predictedXAxisLabel = '',
    xAxisLabel = {},
    labels,
    xAxisDataKey,
    lastUpdatedReadings,
    weatherStationName,
  } = useSensorReadingsLineChart(readingType);

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <Spinner />
      </div>
    );
  } else if (!sensorsReadings.length) {
    return (
      <div>
        <div className={styles.titleWrapper}>
          <label>
            <Semibold className={styles.title}>{labels.title}</Semibold>
          </label>
        </div>
        <div className={styles.emptyRect}>
          <label className={styles.emptyRectMessasge}>{noDataFoundMessage}</label>
        </div>
      </div>
    );
  } else {
    return (
      <PureSensorReadingsLineChart
        showSpotLight={!sensor_reading_chart}
        resetSpotlight={resetSpotlight}
        isReadingTypeActive={true}
        title={labels.title}
        subTitle={labels.subTitle}
        xAxisDataKey={xAxisDataKey}
        yAxisDataKeys={yAxisDataKeys}
        lineColors={lineColors}
        xAxisLabel={xAxisLabel[readingType]}
        yAxisLabel={labels.yAxisLabel}
        chartData={sensorsReadings}
        weatherStationName={weatherStationName}
        lastUpdatedReadings={lastUpdatedReadings}
        predictedXAxisLabel={predictedXAxisLabel}
        readingType={readingType}
      />
    );
  }
};

SensorReadingsLineChart.propTypes = {
  readingType: PropTypes.string.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
