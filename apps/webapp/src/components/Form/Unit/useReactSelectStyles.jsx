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
import { useMemo } from 'react';
import { styles as reactSelectDefaultStyles } from '../ReactSelect';

const useReactSelectStyles = (disabled, { reactSelectWidth } = {}) => {
  return useMemo(
    () => ({
      ...reactSelectDefaultStyles,
      container: (provided, state) => ({
        ...provided,
      }),
      control: (provided, state) => ({
        display: 'flex',
        border: `none`,
        boxShadow: 'none',
        boxSizing: 'border-box',
        borderRadius: '4px',
        height: '48px',
        paddingLeft: '0',
        fontSize: '16px',
        lineHeight: '24px',
        color: 'var(--fontColor)',
        background: 'transparent',
      }),
      valueContainer: (provided, state) => ({
        ...provided,
        padding: '0',
        width: `${reactSelectWidth - 19}px`,
        display: 'flex',
        justifyContent: 'center',
        background: disabled ? 'var(--inputDisabled)' : 'inherit',
      }),
      singleValue: (provided, state) => ({
        fontSize: '16px',
        lineHeight: '24px',
        color: state.isDisabled ? 'var(--grey600)' : 'var(--fontColor)',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontFamily: '"Open Sans", "SansSerif", serif',
        overflowX: 'hidden',
      }),
      placeholder: () => ({
        display: 'none',
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        display: state.isDisabled ? 'none' : 'flex',
        padding: ' 14px 0 12px 0',
        transform: 'translateX(-4px)',
      }),
    }),
    [disabled, reactSelectWidth],
  );
};

export default useReactSelectStyles;
