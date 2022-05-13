import Layout from '../Layout';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';
import { colors } from '../../assets/theme';
import Button from '../../components/Form/Button';
import { Semibold, Text } from '../Typography';
import { getNotificationCardDate } from '../../util/moment.js';
import history from '../../history';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

function PureNotificationReadOnly({ onGoBack, notification }) {
  const { t } = useTranslation();
  const currentLang = getLanguageFromLocalStorage();
  const tOptions = notification.variables.reduce((optionsSoFar, currentOption) => {
    let options = { ...optionsSoFar };
    options[currentOption.name] = currentOption.translate
      ? t(currentOption.value)
      : currentOption.value;
    return options;
  }, {});

  return (
    <Layout>
      <PageTitle
        onGoBack={onGoBack}
        title={t('NOTIFICATION.PAGE_TITLE')}
        style={{ marginBottom: '24px' }}
      />
      <div
        style={{
          width: '49px',
          height: '8px',
          left: '16px',
          top: '313px',
          fontFamily: 'Open Sans',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: '10px',
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#66738A',
          marginBottom: '16px',
        }}
      >
        {getNotificationCardDate(notification.created_at)}
      </div>

      <Semibold style={{ color: colors.teal700, marginBottom: '16px' }}>
        {notification.title.translation_key
          ? t(notification.title.translation_key)
          : notification.title[currentLang]}
      </Semibold>
      <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
        {notification.body.translation_key
          ? t(notification.body.translation_key, tOptions)
          : notification.body[currentLang]}
      </Text>
      <Button
        sm
        style={{ height: '32px', width: '150px' }}
        onClick={() => {
          const route =
            notification.ref.url ??
            `/${notification.ref.entity.type}s/${notification.ref.entity.id}/read_only`;
          history.push(route);
        }}
      >
        {t('NOTIFICATION.TAKE_ME_THERE')}
      </Button>
    </Layout>
  );
}

export default PureNotificationReadOnly;
