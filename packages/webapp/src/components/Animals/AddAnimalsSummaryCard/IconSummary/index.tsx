/*
 *  Copyright 2024 LiteFarm.org
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
import styles from './styles.module.scss';
import { Main } from '../../../Typography';
import Icon from '../../../Icons';
import type { AnimalSummary, BatchSummary, AnimalSexCountSummary } from '../types';

type IconSummaryProps = (AnimalSummary & { isBatch: false }) | (BatchSummary & { isBatch: true });

export const IconSummary = ({
  isBatch,
  count,
  sexDetails,
  iconKey,
  type,
  breed = '',
}: IconSummaryProps) => {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.iconContainer}>
        <Icon
          iconName={isBatch ? 'BATCH_GREEN' : iconKey}
          className={isBatch ? '' : styles.animalIcon}
        />
      </div>
      <div>
        <Main className={styles.typeAndBreed}>
          {type}
          {breed && (isBatch ? ' - ' : ' ')}
          {breed}
          {!isBatch && ':'}
        </Main>
        <div className={styles.details}>
          {isBatch ? (
            <BatchDetails count={count} />
          ) : (
            <AnimalDetails sexDetails={sexDetails} animalCount={count} />
          )}
        </div>
      </div>
    </div>
  );
};

const BatchDetails = ({ count }: { count: number }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.batchDetail}>
      <Main className={styles.detailText}>{t('ANIMAL.BATCH')}</Main>
      <div className={styles.countBadge}>
        <Main className={styles.countValue}>{count}</Main>
      </div>
    </div>
  );
};

const AnimalDetails = ({
  sexDetails,
  animalCount,
}: {
  sexDetails: AnimalSexCountSummary;
  animalCount: number;
}) => {
  const { t } = useTranslation();
  const sexCountEntries = Object.entries(sexDetails);

  const renderSexCountEntries = () => {
    return sexCountEntries.length
      ? `(${sexCountEntries.map(([sex, count]) => `${count} ${sex}`).join(' / ')})`
      : '';
  };

  return (
    <Main className={styles.detailText}>
      {t('ANIMAL.ANIMAL_COUNT', { count: animalCount })} {renderSexCountEntries()}
    </Main>
  );
};
