/*
 *  Copyright 2026 LiteFarm.org
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

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/Form/Button';
import SurveyIcon from '../../../assets/images/survey.svg?react';
import styles from './styles.module.scss';

const TapeWidget = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.info}>
          <span className={styles.badge}>FAO TAPE</span>
          <p className={styles.title}>{t('HOME.TAPE_WIDGET.TITLE')}</p>
          <p className={styles.description}>{t('HOME.TAPE_WIDGET.DESCRIPTION')}</p>
        </div>
        <Button
          sm
          className={styles.button}
          color="secondary-2"
          type="button"
          onClick={() => navigate('/insights')}
        >
          <SurveyIcon />
          {t('HOME.TAPE_WIDGET.START_ASSESSMENT')}
        </Button>
      </div>
    </div>
  );
};

export default TapeWidget;
