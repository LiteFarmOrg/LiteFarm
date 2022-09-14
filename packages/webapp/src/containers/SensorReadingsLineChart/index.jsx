import React from 'react';
import PropTypes from 'prop-types';
import { useSensorReadingsLineChart } from './useSensorReadingsLineChart';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import styles from './styles.module.scss';
import Spinner from '../../components/Spinner';

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
  lastUpdatedTemperatureReadings = '',
  predictedXAxisLabel = '',
  activeReadingTypes = [],
}) => {
  const {
    sensorsReadingsOfTemperature = [],
    yAxisDataKeys = [],
    lineColors = [],
    loading = true,
  } = useSensorReadingsLineChart(locationIds, readingType, noDataText, ambientTempFor);
  return (
    <>
      {loading ? (
        <div className={styles.loaderWrapper}>
          <Spinner />
        </div>
      ) : (
        <PureSensorReadingsLineChart
          isReadingTypeActive={activeReadingTypes.includes(readingType)}
          title={title}
          subTitle={subTitle}
          xAxisDataKey={xAxisDataKey}
          yAxisDataKeys={yAxisDataKeys}
          lineColors={lineColors}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          chartData={sensorsReadingsOfTemperature}
          weatherStationName={weatherStationName}
          lastUpdatedTemperatureReadings={lastUpdatedTemperatureReadings}
          predictedXAxisLabel={predictedXAxisLabel}
        />
      )}
    </>
  );
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
  lastUpdatedTemperatureReadings: PropTypes.string.isRequired,
  predictedXAxisLabel: PropTypes.string.isRequired,
  activeReadingTypes: PropTypes.array.isRequired,
};

export default SensorReadingsLineChart;
