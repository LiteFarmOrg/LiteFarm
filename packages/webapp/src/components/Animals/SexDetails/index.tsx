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

import { useState } from 'react';
import SexDetailsPopover, { Details } from './SexDetailsPopover';
import InputBase from '../../Form/InputBase';
import styles from './styles.module.scss';

type SexDetailsProps = {
  details: Details;
  count: number;
  onConfirm: (d: Details) => void;
  onCancel?: () => void;
};

export default function SexDetails({ details, count, onConfirm, onCancel }: SexDetailsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <InputBase
        label="Sex details"
        optional
        mainSection={
          <button onClick={(e) => setAnchor(e.currentTarget)} className={styles.button}>
            {details.map(({ id, label, count }) => (
              <span key={id}>
                {label}
                <span className={styles.count}>{count}</span>
              </span>
            ))}
          </button>
        }
      />
      {!!anchor && (
        <SexDetailsPopover
          maxCount={count}
          anchor={anchor}
          initialDetails={details}
          onCancel={() => {
            setAnchor(null);
            onCancel?.();
          }}
          onConfirm={(details) => {
            setAnchor(null);
            onConfirm(details);
          }}
        />
      )}
    </>
  );
}
