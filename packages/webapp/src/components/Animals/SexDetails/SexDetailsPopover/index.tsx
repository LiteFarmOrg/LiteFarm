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

import { Popover, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import Drawer from '../../../Drawer';
import Button from '../../../Form/Button';
import SexDetailsCount from '../SexDetailsCount';
import styles from './styles.module.scss';

export type Details = {
  id: string | number;
  label: string;
  count: number;
}[];

type SexDetailsPopoverProps = {
  maxCount: number;
  initialDetails: Details;
  onConfirm: (details: Details) => void;
  onCancel: () => void;
  anchor: HTMLElement;
};

export default function SexDetailsPopover({
  maxCount,
  initialDetails,
  anchor,
  onCancel,
  onConfirm,
}: SexDetailsPopoverProps) {
  const [details, setDetails] = useState(structuredClone(initialDetails) as Details);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCountChange = (id: Details[0]['id'], count: number) =>
    setDetails(
      details.map((detail) => {
        if (detail.id === id) detail.count = count;
        return detail;
      }),
    );

  const handleConfirm = () => onConfirm(details);

  return isMobile ? (
    <Drawer isOpen onClose={onCancel} title="Select sexes">
      <SexDetailsCount maxCount={maxCount} details={details} onCountChange={handleCountChange} />
      <div className={styles.buttonWrapper}>
        <Button type="button" color="secondary-cta" sm onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" color="secondary" sm onClick={handleConfirm}>
          Set
        </Button>
      </div>
    </Drawer>
  ) : (
    <Popover
      open
      anchorEl={anchor}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      onClose={handleConfirm}
    >
      <SexDetailsCount maxCount={maxCount} details={details} onCountChange={handleCountChange} />
    </Popover>
  );
}
