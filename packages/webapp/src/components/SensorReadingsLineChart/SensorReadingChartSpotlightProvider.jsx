import { TourProviderWrapper } from '../TourProviderWrapper/TourProviderWrapper';
import { useTranslation } from 'react-i18next';

export function SensorReadingChartSpotlightProvider({ children, open, onFinish }) {
  const { t } = useTranslation();
  return (
    <TourProviderWrapper
      steps={[
        {
          title: t('SENSOR.SENSOR_READING_CHART_SPOTLIGHT.TITLE'),
          contents: [t('SENSOR.SENSOR_READING_CHART_SPOTLIGHT.CONTENT')],
          selector: '#legend',
          popoverStyles: { width: '240px' },
        },
      ]}
      open={open}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
