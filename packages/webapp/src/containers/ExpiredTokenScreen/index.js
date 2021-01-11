import Layout from '../Layout';
import Button from '../Form/Button';
import { ReactComponent } from '../../assets/images/expiredToken/expiredToken.svg';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../Typography';
import PureExpiredTokenScreen from '../../components/ExpiredTokenScreen';

export default function ExpiredTokenScreen() {
  const { t } = useTranslation();

  return <PureExpiredTokenScreen text={t} />;
}

ExpiredTokenScreen.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
};
