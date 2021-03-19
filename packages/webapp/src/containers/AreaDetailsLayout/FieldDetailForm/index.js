import React from 'react';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch } from 'react-redux';
import { fieldEnum } from '../../fieldSlice';
import { useTranslation } from 'react-i18next';

function FieldDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    const message = `${t('FARM_MAP.MAP_FILTER.FIELD')}${t('message:MAP.SUCCESS_POST')}`;
    dispatch(postFieldLocation({ form: data, message: message }));
  };

  return <PureField history={history} submitForm={submitForm} areaType={fieldEnum} />;
}

export default FieldDetailForm;
