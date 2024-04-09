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

import { Text } from '../../../Typography';
import { Info } from '../../../Typography';
import { Error } from '../../../Typography';
import { Details } from '../SexDetailsPopover';
import SexDetailsCountInput from '../SexDetailsCountInput';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

type SexDetailsCountProps = {
  maxCount: number;
  details: Details;
  total: number;
  unspecified: number;
  onCountChange: (countId: Details[0]['id'], count: number) => void;
};

export default function SexDetailsCount({
  details,
  maxCount,
  total,
  unspecified,
  onCountChange,
}: SexDetailsCountProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.countInputs}>
        {details.map(({ id, label, count }) => (
          <SexDetailsCountInput
            key={id}
            max={Math.max(count + unspecified, 0)}
            label={label}
            initialCount={count}
            onCountChange={(count) => onCountChange(id, count)}
          />
        ))}
      </div>
      <div className={styles.helpText}>
        <span className={styles.helpTextUnspecified}>
          {t('ADD_ANIMAL.ANIMALS_TOTAL', { count: maxCount })}
        </span>
        <span className={styles.helpTextTotal}>
          {t('ADD_ANIMAL.ANIMALS_UNSPECIFIED', { count: Math.max(unspecified, 0) })}
        </span>
        {total > maxCount && (
          <Error style={{ marginTop: 0 }}>
            {t('ADD_ANIMAL.SEX_DETAIL_ERROR_POPOVER', { count: maxCount })}
          </Error>
        )}
      </div>
    </div>
  );
}
