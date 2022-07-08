import React from 'react';
import PropTypes from 'prop-types';
import { useSensorReadingsLineChart } from './useSensorReadingsLineChart';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';

const SensorReadingsLineChart = ({
  title = '',
  subTitle = '',
  xAxisDataKey = '',
  xAxisLabel = '',
  yAxisLabel = '',
  locationIds = [],
  reading_type = '',
}) => {
  const {
    sensorsReadingsOfTemperature = [],
    yAxisDataKeys = [],
    lineColors = [],
  } = useSensorReadingsLineChart(locationIds, reading_type);
  return (
    <PureSensorReadingsLineChart
      title={title}
      subTitle={subTitle}
      xAxisDataKey={xAxisDataKey}
      yAxisDataKeys={yAxisDataKeys}
      lineColors={lineColors}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
      chartData={sensorsReadingsOfTemperature}
    />
  );
};

SensorReadingsLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string.isRequired,
  locationIds: PropTypes.array.isRequired,
  reading_type: PropTypes.string.isRequired,
};

export default SensorReadingsLineChart;
