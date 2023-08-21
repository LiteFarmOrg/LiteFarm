import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../../../../components/Modals/ModalComponent/v2';
import Button from '../../../../components/Form/Button';
import { useDispatch } from 'react-redux';
import Input from '../../../../components/Form/Input';
import { addCustomHarvestUse } from '../../saga';
import { Error } from '../../../../components/Typography';

export default function AddHarvestUseTypeModal({ dismissModal, harvestUseTypes }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [harvestUseName, setHarvestUseName] = useState('');
  const [duplicateError, setDuplicateError] = useState(false);

  const onAdd = () => {
    dispatch(addCustomHarvestUse({ name: harvestUseName }));
    dismissModal();
  };

  const onHarvestUseInputChange = (e) => {
    setHarvestUseName(e.target.value);
    if (harvestUseTypes.includes(e.target.value)) {
      setDuplicateError(true);
    } else {
      setDuplicateError(false);
    }
  };

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('TASK.CREATE_CUSTOM_HARVEST_USE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>
          <Button onClick={onAdd} color="primary" sm disabled={duplicateError}>
            {t('common:ADD')}
          </Button>
        </>
      }
    >
      <Input
        style={{ marginTop: '8px' }}
        label={t('TASK.DESCRIBE_HARVEST_USE')}
        onChange={(e) => onHarvestUseInputChange(e)}
      />
      {duplicateError && <Error>{t('TASK.HARVEST_USE_ALREADY_EXISTS')}</Error>}
    </ModalComponent>
  );
}
