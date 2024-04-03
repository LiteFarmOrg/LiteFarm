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

type SexDetailsCountProps = {
  maxCount: number;
  details: Details;
  onCountChange: (countId: Details[0]['id'], count: number) => void;
};

export default function SexDetailsCount({
  details,
  maxCount,
  onCountChange,
}: SexDetailsCountProps) {
  const total = details.reduce((prevCount, { count }) => prevCount + count, 0);
  const unspecified = maxCount - total;

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
        <div className={styles.info}>
          <Info style={{ marginTop: 0 }}>{maxCount} animals total</Info>
          <Text>{Math.max(unspecified, 0)} unspecified</Text>
        </div>
        {total > maxCount && <Error>You cannot have more than {maxCount} animals</Error>}
      </div>
    </div>
  );
}
