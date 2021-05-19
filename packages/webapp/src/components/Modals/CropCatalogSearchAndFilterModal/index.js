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
      title={"Let's Begin"}
      buttonGroup={
        <>
          <Button onClick={dismissModal} sm>
            Got it!
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
