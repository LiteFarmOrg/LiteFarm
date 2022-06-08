/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

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

  const hideTakeMeThere =
    !notification.ref ||
    (!notification.ref?.url &&
      (!notification.ref?.entity ||
        !notification.ref?.entity?.type ||
        !notification.ref?.entity?.id));

  const onTakeMeThere = () => {
    const route =
      notification.ref.url ??
      `/${notification.ref.entity.type}s/${notification.ref.entity.id}/read_only`;
    history.push(route, notification.context);
  };

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
      {!hideTakeMeThere && (
        <Button sm style={{ height: '32px', width: '150px' }} onClick={onTakeMeThere}>
          {t('NOTIFICATION.TAKE_ME_THERE')}
        </Button>
      )}
    </Layout>
  );
}

export default PureNotificationReadOnly;
