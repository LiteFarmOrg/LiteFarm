import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import React from 'react';
import { Label } from '../../Typography';
import { useTranslation } from 'react-i18next';

export default function CropCatalogSearchAndFilterModal({ dismissModal }) {
  const { t } = useTranslation();

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('CROP_CATALOGUE.LETS_BEGIN')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} sm>
            {t('common:GOT_IT')}
          </Button>
        </>
      }
    >
      <>
        <Label style={{ paddingBottom: '16px' }}>{t('CROP_CATALOGUE.SELECT_A_CROP')}</Label>
      </>
    </ModalComponent>
  );
}
