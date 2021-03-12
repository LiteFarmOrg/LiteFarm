import React from 'react';
import { useTranslation } from 'react-i18next';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch } from 'react-redux';

function AreaDetailsField({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
  };

  return <PureField history={history} submitForm={submitForm} />;
}

export default AreaDetailsField;
