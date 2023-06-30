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
import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import CountrySelect from './CountrySelect';
import { colors } from '../../../assets/theme';
import styles from './styles.module.scss';

const CONTROL_CLASSNAME = 'phone-number-select-control';

const PhoneNumberInput = ({ defaultCountry, options }) => {
  const [phone, setPhone] = useState(null);
  const [country, setCountry] = useState({ value: defaultCountry, label: defaultCountry });
  const [wrapperWidth, setWrapperWidth] = useState(null);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const setReactSelectBorderColor = useCallback((color) => {
    document.body.querySelector(`.${CONTROL_CLASSNAME}`).style.borderColor = color;
  }, []);

  const setBorderColor = (color) => {
    setReactSelectBorderColor(color);
    inputRef.current.style.borderColor = color;
  };

  const setWidth = () => {
    if (!wrapperRef.current) {
      return;
    }
    const width = wrapperRef.current.offsetWidth;
    setWrapperWidth(width);
  };

  useEffect(() => {
    setWidth();
    window.addEventListener('resize', () => setWidth());

    return () => setWidth();
  }, []);

  const onPhoneNumberChange = (phone) => {
    setPhone(phone);
    // delay setting the color so that the change is reflected
    setTimeout(() => {
      setReactSelectBorderColor(colors.teal500);
    }, 0);
  };

  // work around of setting state when onFocus since it affects react-select's behaviour
  const onFocus = () => setBorderColor(colors.teal500);
  const onBlur = () => setBorderColor(colors.grey400);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <PhoneInput
        ref={inputRef}
        className={styles.phoneNumberInput}
        international
        defaultCountry={defaultCountry}
        value={phone}
        onChange={onPhoneNumberChange}
        onFocus={onFocus}
        onBlur={onBlur}
        countrySelectComponent={({ iconComponent, onChange }) => (
          <CountrySelect
            classNames={{
              control: () => CONTROL_CLASSNAME,
            }}
            country={country}
            Icon={iconComponent}
            options={options}
            menuWidth={wrapperWidth}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(country) => {
              setCountry(country || undefined);
              onChange(country?.value || undefined);
            }}
          />
        )}
      />
    </div>
  );
};

PhoneNumberInput.propTypes = {
  defaultCountry: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }))
    .isRequired,
};

export default PhoneNumberInput;
