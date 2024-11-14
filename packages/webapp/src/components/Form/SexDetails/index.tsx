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

import { useMemo, useState } from 'react';
import SexDetailsPopover, { Details } from './SexDetailsPopover';
import InputBase from '../InputBase';
import styles from './styles.module.scss';
import { ReactComponent as ChevronDown } from '../../../assets/images/chevron-down-2.svg';
import { useTranslation } from 'react-i18next';
import TextButton from '../Button/TextButton';

type SexDetailsProps = {
  initialDetails: Details;
  maxCount: number;
  onConfirm: (d: Details) => void;
  onCancel?: () => void;
  isDisabled?: boolean;
};

const initialize = (details: Details) => () => structuredClone(details) as Details;

export default function SexDetails({
  maxCount,
  initialDetails,
  onCancel,
  onConfirm,
  isDisabled = false,
}: SexDetailsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [details, setDetails] = useState(initialize(initialDetails));
  const total = details.reduce((prevCount, { count }) => prevCount + count, 0);
  const unspecified = maxCount - total;
  const isPopoverOpen = !!anchor;
  const { t } = useTranslation();

  const handleCancel = () => {
    setAnchor(null);
    setDetails(initialize(initialDetails));
    onCancel?.();
  };

  const handleConfirm = (details: Details) => {
    setAnchor(null);
    onConfirm(details);
  };

  const handleCountChange = (id: Details[0]['id'], count: number) =>
    setDetails(
      details.map((detail) => {
        if (detail.id === id) detail.count = count;
        return detail;
      }),
    );

  // memoizing ensures this readonly input does not update while user is editing the popover
  const anchorInput = useMemo(
    () => (
      <InputBase
        label={t('ADD_ANIMAL.SEX_DETAIL')}
        optional
        error={total > maxCount ? t('ADD_ANIMAL.SEX_DETAIL_ERROR', { count: maxCount }) : undefined}
        showResetIcon={false}
        rightSection={<ChevronDown className={styles.chevronDownIcon} />}
        disabled={isDisabled}
        mainSection={
          <TextButton
            onClick={isDisabled ? () => {} : (e) => setAnchor(e.currentTarget)}
            className={styles.button}
            disabled={isDisabled}
          >
            {!total ? (
              <span className={isPopoverOpen ? styles.placeholderDark : styles.placeholder}>
                {t('ADD_ANIMAL.SPECIFY_SEX')}
              </span>
            ) : (
              details.map(({ id, label, count }) => (
                <span key={id}>
                  {label}
                  <span className={styles.count}>{count}</span>
                </span>
              ))
            )}
          </TextButton>
        }
      />
    ),
    [isPopoverOpen, maxCount],
  );

  return (
    <>
      {anchorInput}
      {isPopoverOpen && (
        <SexDetailsPopover
          anchor={anchor}
          maxCount={maxCount}
          details={details}
          total={total}
          unspecified={unspecified}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          onCountChange={handleCountChange}
        />
      )}
    </>
  );
}
