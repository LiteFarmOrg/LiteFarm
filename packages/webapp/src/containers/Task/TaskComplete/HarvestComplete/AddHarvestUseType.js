import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../../../../components/Modals/ModalComponent/v2';
import Button from '../../../../components/Form/Button';
import { useDispatch } from 'react-redux';
import Input from '../../../../components/Form/Input';
import { addCustomHarvestUse } from '../../saga';

export default function AddHarvestUseTypeModal({ dismissModal }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [harvestUseName, setHarvestUseName] = useState('');

  const onAdd = () => {
    dispatch(addCustomHarvestUse({name: harvestUseName}));
    dismissModal();
  }

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('TASK.CREATE_CUSTOM_HARVEST_USE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onAdd} color="primary" sm>
            {t('common:ADD')}
          </Button>
        </>
      }
    >
      <Input
        style={{ marginBottom: '12px', marginTop: '8px' }}
        label={t('TASK.DESCRIBE_HARVEST_USE')}
        onChange={(e) => setHarvestUseName(e.target.value)}
      />
    </ModalComponent>
  );
}