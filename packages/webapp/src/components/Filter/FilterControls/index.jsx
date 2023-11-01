/*
 *  Copyright 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://wwwl.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';
import TextButton from '../../Form/Button/TextButton';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

const FilterControls = ({ updateFilters, selectAllDisabled, clearAllDisabled }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.filterControlsContainer}>
      <TextButton
        className={styles.filterControl}
        onClick={() => updateFilters(true)}
        disabled={selectAllDisabled}
      >
        {t('FILTER.SELECT_ALL')}
      </TextButton>
      <TextButton
        className={styles.filterControl}
        onClick={() => updateFilters(false)}
        disabled={clearAllDisabled}
      >
        {t('FILTER.CLEAR_ALL')}
      </TextButton>
    </div>
  );
};

FilterControls.propTypes = {
  updateFilters: PropTypes.func.isRequired,
  selectAllDisabled: PropTypes.bool,
  clearAllDisabled: PropTypes.bool,
};

export default FilterControls;
