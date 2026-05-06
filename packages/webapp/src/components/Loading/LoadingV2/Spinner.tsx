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

import styles from './styles.module.scss';

const Spinner = ({ size = 48, className = '' }) => {
  return (
    <svg
      className={`${styles.spinner} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      {/* 1. Top */}
      <rect x="22" width="4" height="12" rx="2" />

      {/* 2. Top-left diagonal */}
      <rect
        x="5.61523"
        y="8.44336"
        width="4"
        height="12"
        rx="2"
        transform="rotate(-45 5.61523 8.44336)"
      />

      {/* 3. Left */}
      <rect y="26" width="4" height="12" rx="2" transform="rotate(-90 0 26)" />

      {/* 4. Bottom-left diagonal */}
      <rect
        x="8.44336"
        y="42.3848"
        width="4"
        height="12"
        rx="2"
        transform="rotate(-135 8.44336 42.3848)"
      />

      {/* 5. Bottom */}
      <rect x="22" y="36" width="4" height="12" rx="2" />

      {/* 6. Bottom-right diagonal */}
      <rect
        x="31.0713"
        y="33.8994"
        width="4"
        height="12"
        rx="2"
        transform="rotate(-45 31.0713 33.8994)"
      />

      {/* 7. Right */}
      <rect x="36" y="26" width="4" height="12" rx="2" transform="rotate(-90 36 26)" />

      {/* 8. Top-right diagonal */}
      <rect
        x="33.8994"
        y="16.9287"
        width="4"
        height="12"
        rx="2"
        transform="rotate(-135 33.8994 16.9287)"
      />
    </svg>
  );
};

export default Spinner;
