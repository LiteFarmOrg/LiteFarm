import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import React from 'react';
import { TourProviderWrapper } from '../../../components/TourProviderWrapper/TourProviderWrapper';

export default function FirstManagementPlanSpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { management_plan_creation } = useSelector(showedSpotlightSelector);
  const onFinish = () => {
    dispatch(setSpotlightToShown('management_plan_creation'));
  };

  const showSpotlight = !management_plan_creation;

  return (
    <>
      {showSpotlight && (
        <TourProviderWrapper
          steps={[
            {
              title: t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.TITLE'),
              contents: [t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.BODY_PART1'), t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.BODY_PART2')],
              position: 'center',
              buttonText: t('common:GOT_IT'),
            },
          ]}
          onFinish={onFinish}
          open={showSpotlight}
        />
      )}
    </>
  );
}
