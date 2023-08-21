import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import React from 'react';
import { TourProviderWrapper } from '../../components/TourProviderWrapper/TourProviderWrapper';

export default function CatalogSpotlight() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { crop_catalog } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('crop_catalog'));
  return <TourProviderWrapper steps={[
    {
      title: t('CROP_CATALOGUE.CROP_CATALOGUE'),
      contents: [t('CROP_CATALOGUE.HERE_YOU_CAN')],
      list: [
        t('CROP_CATALOGUE.ADD_CROPS_T0_YOUR_FARM'),
        t('CROP_CATALOGUE.DOCUMENT_NECESSARY_INFO_FOR_ORGANIC_PRODUCTION'),
        t('CROP_CATALOGUE.CREATE_MANAGEMENT_PLANS'),
      ],
      position: 'center',
    },
    {
      selector: '#filter',
      title: t('CROP_CATALOGUE.LETS_BEGIN'),
      contents: [t('CROP_CATALOGUE.SELECT_A_CROP')],
      position: 'center',
    },
  ]} onFinish={onFinish} open={!crop_catalog}>
    <div
      id={'filter'}
      style={{
        position: 'absolute',
        width: '100%',
        top: 0,
        height: '48px',
        pointerEvents: 'none',
      }}
    />
  </TourProviderWrapper>;

}
