import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import React from 'react';
import { TourProviderWrapper } from '../../../components/TourProviderWrapper/TourProviderWrapper';

export default function RepeatedCropPlanSpotlight({ repeatingPlanCreated, children }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { repeat_management_plan_creation } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('repeat_management_plan_creation'));

  return (
    <TourProviderWrapper
      open={repeatingPlanCreated && !repeat_management_plan_creation}
      steps={[
        {
          title: t('MANAGEMENT_PLAN.REPEATED_MP_SPOTLIGHT.TITLE'),
          contents: [t('MANAGEMENT_PLAN.REPEATED_MP_SPOTLIGHT.BODY')],
          selector: `#repeatingPlan`,
          position: 'top',
          offset: '1px',
          buttonText: t('common:GOT_IT'),
          popoverStyles: { width: '90vw', noArrow: true },
        },
      ]}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
