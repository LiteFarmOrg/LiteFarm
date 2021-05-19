import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import React from 'react';
import { Label } from '../../Typography';
import { useTranslation } from 'react-i18next';

export default function CropCatalogSpotLightModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={'Crop Catalog'}
      buttonGroup={
        <>
          <Button onClick={dismissModal} sm>
            {t('common:NEXT')}
          </Button>
        </>
      }
    >
      <>
        <Label style={{ paddingBottom: '16px' }}>{t('CROP_CATALOGUE.HERE_YOU_CAN')}</Label>

        <ul
          style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', rowGap: '16px' }}
        >
          <li>
            <Label>{t('CROP_CATALOGUE.ADD_CROPS_T0_YOUR_FARM')}</Label>
          </li>
          <li>
            <Label>{t('CROP_CATALOGUE.DOCUMENT_NECESSARY_INFO_FOR_ORGANIC_PRODUCTION')}</Label>
          </li>
          <li>
            <Label>{t('CROP_CATALOGUE.CREATE_MANAGEMENT_PLANS')}</Label>
          </li>
        </ul>
      </>
    </ModalComponent>
  );
}
