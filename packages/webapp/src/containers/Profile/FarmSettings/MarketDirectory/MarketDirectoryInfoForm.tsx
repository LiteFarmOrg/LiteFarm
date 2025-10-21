/*
 *  Copyright 2025 LiteFarm.org
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

interface MarketDirectoryInfoFormProps {
  setIsComplete: (isComplete: boolean) => void;
  isComplete?: boolean;
  close: () => void;
}

const MarketDirectoryInfoForm = ({
  setIsComplete,
  isComplete,
  close,
}: MarketDirectoryInfoFormProps) => {
  // LF-4990 -- RTK Query setup for Market Directory Data here

  return (
    <div>
      {/* LF-4990 -- replace with actual Pure Form Component */}
      <label className={styles.checkboxLabel}>
        Complete Form
        <input
          type="checkbox"
          checked={isComplete}
          onChange={(e) => {
            setIsComplete(e.target.checked);
            if (e.target.checked) {
              close();
            }
          }}
        />
      </label>
    </div>
  );
};

export default MarketDirectoryInfoForm;
