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

const SensorReadingsLineChart = ({
  title = '',
  subTitle = '',
  xAxisDataKey = '',
  xAxisLabel = '',
  yAxisLabel = '',
  locationIds = [],
  readingType = '',
  weatherStationName = '',
  noDataText = '',
  ambientTempFor = '',
  lastUpdatedReadings = '',
  predictedXAxisLabel = '',
  activeReadingTypes = [],
  noDataFoundMessage = '',
}) => {
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
  } = useSensorReadingsLineChart(
    locationIds,
    readingType,
    noDataText,
    ambientTempFor,
    activeReadingTypes,
  );
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
            <Semibold className={styles.title}>{title}</Semibold>
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
        isReadingTypeActive={activeReadingTypes.includes(readingType)}
        title={title}
        subTitle={subTitle}
        xAxisDataKey={xAxisDataKey}
        yAxisDataKeys={yAxisDataKeys}
        lineColors={lineColors}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
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
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string.isRequired,
  locationIds: PropTypes.array.isRequired,
  readingType: PropTypes.string.isRequired,
  weatherStationName: PropTypes.string.isRequired,
  noDataText: PropTypes.string.isRequired,
  ambientTempFor: PropTypes.string.isRequired,
  lastUpdatedReadings: PropTypes.string.isRequired,
  predictedXAxisLabel: PropTypes.string.isRequired,
  activeReadingTypes: PropTypes.array.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
