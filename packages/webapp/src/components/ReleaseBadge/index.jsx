/*
 *  Copyright 2023 LiteFarm.org
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

import { useState } from 'react';
import { ReactComponent as Close } from '../../assets/images/release/x-circle.svg';
import { ReactComponent as NewBubble } from '../../assets/images/release/new-bubble.svg';
import { ReactComponent as ChevronRight } from '../../assets/images/release/chevron-right-dk-red.svg';
import { IconLink, Semibold, Text } from '../Typography';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import TextButton from '../Form/Button/TextButton';

const ReleaseBadge = ({ releaseNotesLink }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    open && (
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <NewBubble className={styles.bubble} />
          <div className={styles.text}>
            <Text className={styles.better}>{t('RELEASE.BETTER')}</Text>

            <a className={styles.link} href={releaseNotesLink} target="_blank" rel="noreferrer">
              <div className={styles.linkSection}>
                <Semibold className={styles.releaseNotes}>{t('RELEASE.NOTES')} </Semibold>
                <ChevronRight className={styles.chevron} />
              </div>
            </a>
          </div>

          <TextButton onClick={() => setOpen(false)} className={styles.closeButton}>
            <Close />
          </TextButton>
        </div>
      </div>
    )
  );
};

export default ReleaseBadge;
