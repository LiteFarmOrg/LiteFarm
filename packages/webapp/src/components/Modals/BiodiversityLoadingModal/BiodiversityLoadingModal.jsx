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

import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HazardIcon } from '../../../assets/images/warning.svg';

const BiodiversityLoadingModal = ({ dismissModal, loadingError }) => {
  const { t } = useTranslation();
  return loadingError ? (
    <ModalComponent
      title={[t('INSIGHTS.BIODIVERSITY.ERROR_TITLE')]}
      contents={
        loadingError === 'API_OFFSET_LIMIT'
          ? [t('INSIGHTS.BIODIVERSITY.API_OFFSET_LIMIT_ERROR_MESSAGE')]
          : [t('INSIGHTS.BIODIVERSITY.GENERIC_ERROR_MESSAGE')]
      }
      dismissModal={dismissModal}
      icon={HazardIcon}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} sm>
            {t('common:OK')}
          </Button>
        </>
      }
      error
    />
  ) : (
    <ModalComponent
      title={t('INSIGHTS.BIODIVERSITY.LOADING.TITLE')}
      contents={[t('INSIGHTS.BIODIVERSITY.LOADING.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} sm>
            {t('common:CANCEL')}
          </Button>
        </>
      }
    />
  );
};

export default BiodiversityLoadingModal;
