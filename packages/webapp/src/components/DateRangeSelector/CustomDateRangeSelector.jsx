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
import clsx from 'clsx';
import { BsChevronLeft } from 'react-icons/bs';
import { Semibold, Underlined } from '../Typography';
import { FromToDateContainer } from '../Inputs/DateContainer';
import TextButton from '../Form/Button/TextButton';
import styles from './styles.module.scss';

export default function CustomDateRangeSelector({
  onBack,
  onClear,
  isValid,
  isValidRange,
  startDate,
  endDate,
  changeStartDate,
  changeEndDate,
  fromDateMax,
  toDateMin,
  cleanup,
}) {
  const { t } = useTranslation();
  const inputStyle = { classes: { container: { minWidth: 'calc((100% - 24px) / 2)' } } };

  useEffect(() => {
    return () => cleanup?.();
  }, []);

  return (
    <div className={styles.customDateRangeSelector}>
      <div className={styles.buttons}>
        <TextButton className={clsx(styles.backButton)} onClick={onBack} disabled={!isValid}>
          <BsChevronLeft />
          {t('DATE_RANGE_SELECTOR.BACK')}
        </TextButton>
        <Underlined className={styles.clearDates} onClick={onClear}>
          {t('DATE_RANGE_SELECTOR.CLEAR_DATES')}
        </Underlined>
      </div>
      <FromToDateContainer
        onStartDateChange={changeStartDate}
        onEndDateChange={changeEndDate}
        endDate={endDate}
        startDate={startDate}
        fromProps={{ max: fromDateMax, ...inputStyle }}
        toProps={{ min: toDateMin, ...inputStyle }}
      />
      {startDate && endDate && !isValidRange && (
        <Semibold style={{ textAlign: 'center', color: 'red' }}>
          {t('DATE_RANGE.INVALID_RANGE_MESSAGE')}
        </Semibold>
      )}
    </div>
  );
}

CustomDateRangeSelector.propTypes = {
  onBack: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  isValidRange: PropTypes.bool.isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  changeStartDate: PropTypes.func.isRequired,
  changeEndDate: PropTypes.func.isRequired,
  fromDateMax: PropTypes.string,
  toDateMin: PropTypes.string,
  cleanup: PropTypes.func,
};
