import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureExpiredTokenScreen from '../../components/ExpiredTokenScreen';

export default function ExpiredTokenScreen({ history }) {
  const { t } = useTranslation();
  const [translation_key, setTranslationKey] = useState();

  useEffect(() => {
    const { translation_key } = history.location;
    if (translation_key) {
      setTranslationKey(translation_key);
    } else {
      history.push('/');
    }
  }, []);
  return <PureExpiredTokenScreen text={t(`EXPIRED_TOKEN.${translation_key || 'DEFAULT'}`)} />;
}

ExpiredTokenScreen.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
};
