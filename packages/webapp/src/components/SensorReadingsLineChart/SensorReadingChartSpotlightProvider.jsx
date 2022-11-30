import { TourProviderWrapper } from '../TourProviderWrapper/TourProviderWrapper';
import { useTranslation } from 'react-i18next';

export function SensorReadingChartSpotlightProvider({ children, open, onFinish }) {
  const { t } = useTranslation();
  return (
    <TourProviderWrapper
      steps={[
        {
          selector: '#zerothStepNavBar',
          title: t('NAVIGATION.SPOTLIGHT.NOTIFICATION_TITLE'),
          contents: [t('NAVIGATION.SPOTLIGHT.YOU_CAN')],
          list: [
            t('NAVIGATION.SPOTLIGHT.SEE_UPDATES'),
            t('NAVIGATION.SPOTLIGHT.MANAGE_TASK'),
            t('NAVIGATION.SPOTLIGHT.COORDINATE_ACTIVITIES'),
          ],
          position: 'bottom',
          popoverStyles: { width: '240px' },
        },
        {
          selector: '#firstStepNavBar',
          title: t('NAVIGATION.SPOTLIGHT.FARM_TITLE'),
          contents: [t('NAVIGATION.SPOTLIGHT.YOU_CAN')],
          list: [
            t('NAVIGATION.SPOTLIGHT.EDIT_FARM_SETTING'),
            t('NAVIGATION.SPOTLIGHT.MAP_FARM'),
            t('NAVIGATION.SPOTLIGHT.MANAGE_EMPLOYEE'),
          ],
          position: 'bottom',
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
