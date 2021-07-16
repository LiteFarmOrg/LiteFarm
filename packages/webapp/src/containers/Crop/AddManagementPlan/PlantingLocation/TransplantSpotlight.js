import JoyrideWrapper from '../../../../components/JoyrideWrapper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../../Map/saga';
import React, { useState } from 'react';
import { LIFECYCLE } from 'react-joyride';

export default function TransplantSpotlight({ seedingType }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { transplant } = useSelector(showedSpotlightSelector);
  const callback = (data) => {
    console.log({ data });
    // const { lifecycle } = data;
    // if (lifecycle === LIFECYCLE.COMPLETE) {
    //   dispatch(setSpotlightToShown(data.step.flag));
    // }
  };

  const showSpotlight = !transplant;

  console.log(seedingType);
  const titleFill =
    seedingType === 'SEEDLING_OR_PLANTING_STOCK'
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.PLANTING')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.SEEDING');
  const bodyFill =
    seedingType === 'SEEDLING_OR_PLANTING_STOCK'
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.PLANTED')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.SEEDED');

  return (
    <>
      {showSpotlight && (
        <JoyrideWrapper
          steps={[
            {
              title: t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.TEXT', { fill: titleFill }),
              contents: [t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.TEXT', { fill: bodyFill })],
              target: 'body',
              placement: 'center',
              disableCloseOnEsc: true,
              buttonText: t('common:GOT_IT'),
              flag: 'compliance_docs_and_certification',
            },
          ]}
          callback={callback}
        />
      )}
    </>
  );
}
