import JoyrideWrapper from '../../../components/JoyrideWrapper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { setSpotlightToShown } from '../../Map/saga';
import React from 'react';

export default function CropVarietySpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { crop_variety_detail } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('crop_variety_detail'));
  const managementId = `#${t('CROP_DETAIL.MANAGEMENT_TAB')}0`
  const detailId = `#${t('CROP_DETAIL.DETAIL_TAB')}1`

  return (
    <>
      { !crop_variety_detail && (
        <>
          <JoyrideWrapper
            steps={[
              {
                title: t('MANAGEMENT_PLAN.MANAGEMENT_SPOTLIGHT_TITLE'),
                contents: [t('MANAGEMENT_PLAN.SPOTLIGHT_HERE_YOU_CAN')],
                list: [
                  t('MANAGEMENT_PLAN.MANAGEMENT_SPOTLIGHT_1'),
                  t('MANAGEMENT_PLAN.MANAGEMENT_SPOTLIGHT_2'),
                  t('MANAGEMENT_PLAN.MANAGEMENT_SPOTLIGHT_3'),
                ],
                buttonText: t('common:NEXT'),
                target: managementId,
                placement: 'bottom',
                disableCloseOnEsc: true,
              },
              {
                title: t('MANAGEMENT_PLAN.DETAIL_SPOTLIGHT_TITLE'),
                contents: [t('MANAGEMENT_PLAN.SPOTLIGHT_HERE_YOU_CAN')],
                list: [
                  t('MANAGEMENT_PLAN.DETAILS_SPOTLIGHT_1'),
                  t('MANAGEMENT_PLAN.DETAILS_SPOTLIGHT_2')
                ],
                target: detailId,
                placement: 'bottom',
                disableBeacon: true,
                buttonText: t('MANAGEMENT_PLAN.STARTED'),
              },
            ]}
            onFinish={onFinish}
          />
        </>
      )}
    </>
  );
}
