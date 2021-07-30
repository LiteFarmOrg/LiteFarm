import JoyrideWrapper from '../../../../components/JoyrideWrapper';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../../Map/saga';
import React, { useState } from 'react';
import { LIFECYCLE } from 'react-joyride';
import { ReactComponent as PlantIcon } from '../../../../assets/images/managementPlans/plant.svg';

export default function TransplantSpotlight({ seedingType }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { transplant } = useSelector(showedSpotlightSelector);
  const callback = (data) => {
    const { lifecycle } = data;
    if (lifecycle === LIFECYCLE.COMPLETE) {
      dispatch(setSpotlightToShown('transplant'));
    }
  };

  const showSpotlight = !transplant;

  const titleFill =
    seedingType === 'SEEDLING_OR_PLANTING_STOCK'
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.PLANTING')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.SEEDING');
  const bodyFill =
    seedingType === 'SEEDLING_OR_PLANTING_STOCK'
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.PLANTED')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.SEEDED');

  // this is an unused variable, but it is required for the translation to work
  const spotlightText = t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.TEXT');

  return (
    <>
      {showSpotlight && (
        <JoyrideWrapper
          steps={[
            {
              title: t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.TEXT', { fill: titleFill }),
              contents: [
                <Trans i18nKey={'MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.TEXT'}>
                  Please indicate where this crop will be initially
                  <strong>{{ fill: bodyFill }}</strong>. We’ll ask about where you’ll transplant it
                  to later.
                </Trans>,
              ],
              target: 'body',
              placement: 'center',
              disableCloseOnEsc: true,
              buttonText: t('common:GOT_IT'),
              icon: <PlantIcon />,
            },
          ]}
          callback={callback}
        />
      )}
    </>
  );
}
