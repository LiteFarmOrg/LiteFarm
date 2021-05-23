import React from 'react';
import { useDispatch } from 'react-redux';
import history from '../../../history';
import { addHarvestUseType } from '../actions';
import { useTranslation } from 'react-i18next';
import PureAddHarvestUse from '../../../components/Logs/PureAddHarvestUse';

function AddHarvestUse() {
  const dispatch = useDispatch();
  const { t } = useTranslation(['translation', 'message']);

  const dispatchAddUseType = (useTypeName) => dispatch(addHarvestUseType(useTypeName));

  return (
    <PureAddHarvestUse
      title={t('LOG_HARVEST.ADD_A_HARVEST_USE')}
      onGoBack={() => {
        history.push('/harvest_use_type', { isCustomHarvestUsePage: true });
      }}
      onSubmit={dispatchAddUseType}
    />
  );
}

export default AddHarvestUse;
