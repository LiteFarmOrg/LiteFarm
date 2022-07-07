import React from 'react';
import { useTranslation } from 'react-i18next';
import ReadingsLineChart from '../../components/ReadingsLineChart';
import { CURRENT_DATE_TIME } from './constants';

function SensorReadings() {
  const { t } = useTranslation();
  return (
    <>
      <ReadingsLineChart
        title="Soil temperature"
        subTitle={`Today’s ambient high and low temperature: {high}° {tempUnit} / {low}° {tempUnit}`}
        xAxisDataKey={CURRENT_DATE_TIME}
        yAxisLabel={`Temperature in {tempUnit}`}
        locationIds={[
          '1a8f428d-3a9c-481d-b9bf-10b3ed651c38',
          '85aa1462-40ee-4aa2-a3c6-dfd8505646b2',
          'adcf083e-4cd9-48f9-b411-22ed07b9e5c9',
          'e90e143e-4066-4d47-8de5-d12d1fc216dc',
          'c84b01f0-5708-4b0b-8182-22970059d83f',
        ]}
      />
    </>
  );
}

export default SensorReadings;
