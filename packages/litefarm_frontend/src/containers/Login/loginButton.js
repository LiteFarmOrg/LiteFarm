/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (loginButton.js) is part of LiteFarm.
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

import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

function LoginButton({ auth }) {
  const { t, i18n } = useTranslation();

  function login() {
    auth.login();
  }
  return (
    <div className={styles.submit}>
      <Button onClick={() => login()}>{t('common:LOGIN_BUTTON')}</Button>
    </div>
  );
}

export default LoginButton;
