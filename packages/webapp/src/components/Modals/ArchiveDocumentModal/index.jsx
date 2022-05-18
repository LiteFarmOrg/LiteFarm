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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';

export default function ArchiveDocumentModal({ onSetArchive, dismissModal, isForArchiving }) {
  const { t } = useTranslation();
  const archiveStr = isForArchiving ? 'ARCHIVE' : 'UNARCHIVE';

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t(`DOCUMENTS.${archiveStr}_DOCUMENT`)}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('DOCUMENTS.CANCEL')}
          </Button>

          <Button onClick={onSetArchive} className={styles.button} color="primary" sm>
            {t(`DOCUMENTS.${archiveStr}`)}
          </Button>
        </>
      }
    >
      <div className={styles.stepList}>{t(`DOCUMENTS.${archiveStr}_DOCUMENT_TEXT`)}</div>
    </ModalComponent>
  );
}

ArchiveDocumentModal.propTypes = {
  onSetArchive: PropTypes.func,
  dismissModal: PropTypes.func,
  isForArchiving: PropTypes.bool, // whether this is an archive modal or unarchive modal
};
