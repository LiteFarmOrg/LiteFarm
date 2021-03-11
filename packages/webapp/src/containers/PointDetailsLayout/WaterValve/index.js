import React from 'react';
import { useTranslation } from 'react-i18next';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';

function Gate({ history }) {
  const { t } = useTranslation();

  return <PureWaterValve history={history} />;
}

export default Gate;
