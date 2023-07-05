/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { getCountryCallingCode } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import ReactSelect from '../ReactSelect';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';
import styles from './styles.module.scss';

const getStyles = (menuWidth) => ({
  ...reactSelectDefaultStyles,
  control: (provided, state) => ({
    ...reactSelectDefaultStyles.control(null, state),
    borderRadius: '4px 0 0 4px',
    borderRight: 'none',
    height: '48px',
    width: '72px',
    '&:hover': {
      borderColor: 'none',
    },
  }),
  valueContainer: (provided, state) => ({
    ...reactSelectDefaultStyles.valueContainer(null, state),
    maxHeight: '48px',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    paddingLeft: '9px',
  }),
  singleValue: (provided, state) => ({
    ...reactSelectDefaultStyles.singleValue(null, state),
    width: '100%',
    height: '21px',
  }),
  menu: (provided, state) => ({
    ...reactSelectDefaultStyles.menu(null, state),
    width: menuWidth,
    marginTop: 0,
    border: 'solid 1px var(--inputActive)',
    borderTop: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...reactSelectDefaultStyles.dropdownIndicator(null, state),
    paddingRight: '7px',
    color: 'var(--grey600)',
  }),
});

const CountrySelect = ({
  classNames,
  country,
  Icon,
  onChange,
  menuWidth,
  options,
  onFocus,
  onBlur,
}) => {
  const getFormattedCountryCallingCode = (value) => {
    // getCountryCallingCode function does not support some country codes like "PN"
    // https://github.com/google/libphonenumber/blob/master/FAQ.md#why-are-bouvet-island-bv-pitcairn-island-pn-antarctica-aq-etc-not-supported
    try {
      if (!value) {
        return;
      }
      return `+${getCountryCallingCode(value)}`;
    } catch (e) {}
  };

  return (
    <Suspense fallback={<div className={styles.emptyDiv} />}>
      <ReactSelect
        classNames={classNames}
        styles={getStyles(menuWidth)}
        value={country}
        options={options}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        formatOptionLabel={({ value, label }, meta) => {
          if (value && meta.context === 'menu') {
            return (
              <div className={styles.option}>
                <Icon country={value} label={value} />
                <span className={styles.countryName}>{label}</span>
                <span className={clsx(styles.code)}>{getFormattedCountryCallingCode(value)}</span>
              </div>
            );
          }
          return <Icon country={value} label={value || 'international'} />;
        }}
      />
    </Suspense>
  );
};

CountrySelect.propTypes = {
  classNames: PropTypes.object,
  country: PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }),
  Icon: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }))
    .isRequired,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  menuWidth: PropTypes.number,
};

export default CountrySelect;
