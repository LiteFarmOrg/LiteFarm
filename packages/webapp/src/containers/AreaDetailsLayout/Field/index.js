import React from 'react';
import { useTranslation } from 'react-i18next';
import PureField from '../../../components/AreaDetailsLayout/Field';

function AreaDetailsField({ history }) {
  const { t } = useTranslation();

  return <PureField history={history} />;
}

export default AreaDetailsField;
