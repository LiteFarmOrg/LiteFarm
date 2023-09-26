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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BsChevronLeft } from 'react-icons/bs';
import { Underlined } from '../Typography';
import DateRangePicker from '../Form/DateRangePicker';
import { addDaysToDate } from '../../util/moment';
import styles from './styles.module.scss';

export default function CustomDateRangeSelector({
  register,
  getValues,
  control,
  onBack,
  onClear,
  onCleanUp,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    return () => onCleanUp();
  }, []);

  return (
    <div className={styles.customDateRangeSelector}>
      <div className={styles.buttons}>
        <div className={styles.backButton} onClick={onBack}>
          <BsChevronLeft />
          {t('DATE_RANGE_SELECTOR.BACK')}
        </div>
        <Underlined className={styles.clearDates} onClick={onClear}>
          {t('DATE_RANGE_SELECTOR.CLEAR_DATES')}
        </Underlined>
      </div>
      <DateRangePicker
        register={register}
        getValues={getValues}
        control={control}
        fromProps={{ max: addDaysToDate(new Date(), -1, { toUTC: false }) }}
      />
    </div>
  );
}

CustomDateRangeSelector.propTypes = {
  register: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onCleanUp: PropTypes.func.isRequired,
};
