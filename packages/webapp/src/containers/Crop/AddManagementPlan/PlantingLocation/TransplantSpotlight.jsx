import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../../Map/saga';
import React from 'react';
import PlantIcon from '../../../../assets/images/managementPlans/plant.svg';
import { TourProviderWrapper } from '../../../../components/TourProviderWrapper/TourProviderWrapper';

export default function TransplantSpotlight({ is_seed }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { transplant } = useSelector(showedSpotlightSelector);
  const onFinish = (data) => dispatch(setSpotlightToShown('transplant'));

  const showSpotlight = !transplant;

  const titleFill =
    is_seed === false
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.PLANTING')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.SEEDING');
  const bodyFill =
    is_seed === true
      ? t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.PLANTED')
      : t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.SEEDED');

  // this is an unused variable, but it is required for the translation to work
  const spotlightText = t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.TEXT');

  return (
    <TourProviderWrapper
      steps={[
        {
          title: t('MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.TITLE.TEXT', { fill: titleFill }),
          contents: [
            <Trans
              i18nKey={'MANAGEMENT_PLAN.TRANSPLANT_SPOTLIGHT.BODY.TEXT'}
              key="TransplantSpotlight"
            >
              Please indicate where this crop will be initially
              <strong>{{ fill: bodyFill }}</strong>. We’ll ask about where you’ll transplant it to
              later.
            </Trans>,
          ],
          position: 'center',
          icon: <PlantIcon />,
        },
      ]}
      open={showSpotlight}
      onFinish={onFinish}
    />
  );
}
