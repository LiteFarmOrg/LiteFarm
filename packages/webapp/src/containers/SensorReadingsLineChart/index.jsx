import React from 'react';
import PropTypes from 'prop-types';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import { Semibold } from '../../components/Typography';
import { CHART_LINE_COLORS, CURRENT_DATE_TIME, TEMPERATURE } from '../SensorReadings/constants';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

const SensorReadingsLineChart = ({ readingType, noDataFoundMessage, data }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };
  const title = t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.TITLE`);
  const readingTypeDataExists = data?.sensorReadingData?.find(
    (rd) =>
      rd[data.selectedSensorName] && rd[data.selectedSensorName] != t('translation:SENSOR.NO_DATA'),
  );
  let isActive = readingTypeDataExists ? true : false;
  if (readingType === TEMPERATURE) {
    const weatherStationDataExists = data?.sensorReadingData?.find(
      (rd) => rd[data.stationName] != t('translation:SENSOR.NO_DATA'),
    );
    isActive = weatherStationDataExists || isActive;
  }

  return (
    <>
      {!isActive && (
        <>
          <div className={styles.titleWrapper}>
            <label>
              <Semibold className={styles.title}>{title}</Semibold>
            </label>
          </div>
          <div className={styles.emptyRect}>
            <label className={styles.emptyRectMessasge}>{noDataFoundMessage}</label>
          </div>
        </>
      )}
      {isActive && data && data.sensorReadingData?.length && data.unit && (
        <PureSensorReadingsLineChart
          showSpotLight={!sensor_reading_chart}
          resetSpotlight={resetSpotlight}
          title={title}
          subTitle={t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.Y_AXIS_LABEL`, {
            units: t(
              `SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.${data.unit.toUpperCase()}`,
            ),
          })}
          predictedXAxisLabel={data.predictedXAxisLabel}
          sensorReadings={data.sensorReadingData}
          lastUpdatedReadings={data.lastUpdatedReadingsTime}
          xAxisDataKey={CURRENT_DATE_TIME}
          yAxisDataKeys={Object.keys(data.sensorReadingData[0]).filter(
            (f) => f !== CURRENT_DATE_TIME,
          )} // or != xAxisDataKey
          lineColors={CHART_LINE_COLORS}
        />
      )}
    </>
  );
};

SensorReadingsLineChart.propTypes = {
  readingType: PropTypes.string.isRequired,
  noDataFoundMessage: PropTypes.string.isRequired,
  data: PropTypes.shape({
    lastUpdatedReadingsTime: PropTypes.string.isRequired,
    latestTemperatureReadings: PropTypes.shape({
      tempMin: PropTypes.number,
      tempMax: PropTypes.number,
    }),
    predictedXAxisLabel: PropTypes.string.isRequired,
    selectedSensorName: PropTypes.string.isRequired,
    sensorReadingData: PropTypes.array.isRequired,
    stationName: PropTypes.string,
    xAxisLabel: PropTypes.string.isRequired,
  }),
};

export default SensorReadingsLineChart;
