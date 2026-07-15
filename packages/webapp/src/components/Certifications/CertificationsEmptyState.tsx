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

import { useTranslation } from 'react-i18next';
import { ReactComponent as AwardIcon } from '../../assets/images/nav/certifications.svg';
import { ReactComponent as PlusCircleIcon } from '../../assets/images/plus-circle.svg';
import Button from '../Form/Button';
import styles from './index.module.scss';

interface CertificationsEmptyStateProps {
  onAddCertification: () => void;
}

export default function CertificationsEmptyState({
  onAddCertification,
}: CertificationsEmptyStateProps) {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div className={styles.emptyState}>
      <AwardIcon className={styles.emptyIcon} aria-hidden />
      <p className={styles.emptyHeading}>{t('CERTIFICATION.EMPTY_STATE.HEADING')}</p>
      <p className={styles.emptyBody}>{t('CERTIFICATION.EMPTY_STATE.BODY')}</p>
      <Button color="primary" onClick={onAddCertification} md>
        <PlusCircleIcon className={styles.plusIcon} />
        {t('common:START_HERE')}
      </Button>
    </div>
  );
}
