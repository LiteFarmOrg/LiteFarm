import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import React from 'react';
import { TourProviderWrapper } from '../../../components/TourProviderWrapper/TourProviderWrapper';

export default function RepeatedCropPlanSpotlight({ children }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { repeated_crop_plan } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('repeated_crop_plan'));

  return (
    <TourProviderWrapper
      open={true}
      steps={[
        {
          title: t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.TITLE'),
          contents: [t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.BODY_PART1'), t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.BODY_PART2')],
          selector:  `#plan0`,
          position: 'center',
          offset: '1px',
          buttonText: t('common:GOT_IT'),
        },
      ]}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
