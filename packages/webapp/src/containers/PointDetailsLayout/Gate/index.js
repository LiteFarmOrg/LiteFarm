import React from 'react';
import { useTranslation } from 'react-i18next';
import PureGate from '../../../components/PointDetailsLayout/Gate';

function Gate({ history }) {
  const { t } = useTranslation();

  return <PureGate history={history} />;
}

export default Gate;
