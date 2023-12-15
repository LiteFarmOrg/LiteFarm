import { TourProviderWrapper } from '../../TourProviderWrapper/TourProviderWrapper';
import { useTranslation } from 'react-i18next';

export function NavbarSpotlightProvider({ children, open, onFinish }) {
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
          selector: '#secondStepNavBar',
          title: t('NAVIGATION.SPOTLIGHT.PROFILE_TITLE'),
          contents: [t('NAVIGATION.SPOTLIGHT.YOU_WILL_FIND')],
          list: [
            t('NAVIGATION.SPOTLIGHT.INFO'),
            t('NAVIGATION.SPOTLIGHT.TIPS'),
            t('NAVIGATION.SPOTLIGHT.LOG_OUT'),
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

export function NavBarNotificationSpotlightProvider({ children, open, onFinish }) {
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
      ]}
      open={open}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
