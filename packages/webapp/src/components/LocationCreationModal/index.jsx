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
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modals';
import styles from './styles.module.scss';
import Button from '../Form/Button';
import PropTypes from 'prop-types';
import { Info, Semibold } from '../Typography';

export default function LocationCreationModal({ title, body, dismissModal, locationCreation }) {
  const { t } = useTranslation();

  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <div className={styles.modalHeaderWrapper}>
          <Semibold className={styles.title}>{title}</Semibold>
        </div>
        <Info className={styles.body}>{body}</Info>
        <div className={styles.buttonContainer}>
          <Button onClick={dismissModal} sm>
            {t('common:BACK')}
          </Button>
          <Button onClick={locationCreation} sm>
            Create location
          </Button>
        </div>
      </div>
    </Modal>
  );
}

LocationCreationModal.prototype = {
  title: PropTypes.string,
  body: PropTypes.string,
  dismissModal: PropTypes.func,
  locationCreation: PropTypes.func,
};
