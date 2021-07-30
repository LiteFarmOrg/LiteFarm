import JoyrideWrapper from '../../../components/JoyrideWrapper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import React from 'react';
import { LIFECYCLE } from 'react-joyride';

export default function FirstManagementPlanSpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { management_plan_creation } = useSelector(showedSpotlightSelector);
  const callback = (data) => {
    const { lifecycle } = data;
    if (lifecycle === LIFECYCLE.COMPLETE) {
      dispatch(setSpotlightToShown('management_plan_creation'));
    }
  };

  const showSpotlight = !management_plan_creation;

  return (
    <>
      {showSpotlight && (
        <JoyrideWrapper
          steps={[
            {
              title: t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.TITLE'),
              contents: [t('MANAGEMENT_PLAN.FIRST_MP_SPOTLIGHT.BODY')],
              target: 'body',
              placement: 'center',
              disableCloseOnEsc: true,
              buttonText: t('common:GOT_IT'),
            },
          ]}
          callback={callback}
        />
      )}
    </>
  );
}
