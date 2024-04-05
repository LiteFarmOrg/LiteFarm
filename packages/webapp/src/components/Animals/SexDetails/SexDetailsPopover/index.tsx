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
  anchor: HTMLElement;
  details: Details;
  maxCount: number;
  total: number;
  unspecified: number;
  onConfirm: (details: Details) => void;
  onCountChange: (countId: Details[0]['id'], count: number) => void;
  onCancel: () => void;
};

export default function SexDetailsPopover({
  anchor,
  details,
  maxCount,
  total,
  unspecified,
  onConfirm,
  onCountChange,
  onCancel,
}: SexDetailsPopoverProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return isMobile ? (
    <Drawer isOpen onClose={onCancel} title="Select sexes">
      <SexDetailsCount
        maxCount={maxCount}
        total={total}
        unspecified={unspecified}
        details={details}
        onCountChange={onCountChange}
      />
      <div className={styles.buttonWrapper}>
        <Button type="button" color="secondary-cta" sm onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" color="secondary" sm onClick={() => onConfirm(details)}>
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
      onClose={() => onConfirm(details)}
    >
      <SexDetailsCount
        maxCount={maxCount}
        total={total}
        unspecified={unspecified}
        details={details}
        onCountChange={onCountChange}
      />
    </Popover>
  );
}
