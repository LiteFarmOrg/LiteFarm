import React from 'react';
import PropTypes from 'prop-types';
import PureSensorReadingsLineChart from '../../components/SensorReadingsLineChart';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import { useDispatch, useSelector } from 'react-redux';
import { Semibold } from '../../components/Typography';
import { measurementSelector } from '../../containers/userFarmSlice';
import { ambientTemperature, soilWaterPotential } from '../../util/convert-units/unit';
import { getUnitOptionMap } from '../../util/convert-units/getUnitOptionMap';
import {
  CHART_LINE_COLORS,
  CURRENT_DATE_TIME,
  SOIL_WATER_POTENTIAL,
  SOIL_WATER_CONTENT,
  TEMPERATURE,
} from '../SensorReadings/constants';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

const SensorReadingsLineChart = ({ readingType, noDataFoundMessage, data }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { sensor_reading_chart } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown('sensor_reading_chart'));
  };
  const unitSystem = useSelector(measurementSelector);
  const title = t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.TITLE`);
  const readingTypeDataExists = data?.sensorReadingData?.find(
    (rd) => rd[data.selectedSensorName] && rd[data.selectedSensorName] != '(no data)',
  );
  let isActive = readingTypeDataExists ? true : false;
  let unit;

  if (readingType === TEMPERATURE) {
    unit = getUnitOptionMap()[ambientTemperature[unitSystem].defaultUnit].value;
    const weatherStationDataExists = data?.sensorReadingData?.find(
      (rd) => rd[data.stationName] != '(no data)',
    );
    isActive = weatherStationDataExists || isActive;
  }
  if (readingType === SOIL_WATER_POTENTIAL) {
    unit = getUnitOptionMap()[soilWaterPotential[unitSystem].defaultUnit].value;
  }
  if (readingType === SOIL_WATER_CONTENT) unit = '%';

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
      {isActive && data && data.sensorReadingData?.length && unit && (
        <PureSensorReadingsLineChart
          showSpotLight={!sensor_reading_chart}
          resetSpotlight={resetSpotlight}
          title={title}
          subTitle={t(`SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.Y_AXIS_LABEL`, {
            units: t(
              `SENSOR.${readingType.toUpperCase()}_READINGS_OF_SENSOR.${unit.toUpperCase()}`,
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
