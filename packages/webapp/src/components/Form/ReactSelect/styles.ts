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

import { StylesConfig } from 'react-select';
import { colors } from '../../../assets/theme';

export const styles: StylesConfig = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'var(--Colors-Secondary-Secondary-green-100)' : 'white',
    '&:hover': {
      backgroundColor: 'var(--Colors-Secondary-Secondary-green-100)',
    },
    fontSize: '16px',
    lineHeight: '24px',
    color: state.isDisabled ? 'var(--grey400)' : 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
    paddingLeft: '10px',
    minHeight: '40px',
  }),
  groupHeading: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
    paddingLeft: '10px',
    '&:hover': {
      backgroundColor: 'var(--Colors-Secondary-Secondary-green-100)',
    },
    textTransform: 'capitalize',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
  }),

  indicatorSeparator: () => ({}),

  control: (_, state) => ({
    display: 'flex',
    border: `1px solid var(--grey400)`,
    boxShadow: 'none',
    boxSizing: 'border-box',
    borderRadius: '4px',
    minHeight: '48px',
    paddingLeft: '0',
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    borderColor: state.isFocused ? 'var(--inputActive)' : 'var(--grey400)',
    '&:hover': {
      borderColor: 'var(--inputActive)',
    },
  }),

  menu: (provided) => ({
    ...provided,
    marginTop: '4px',
    padding: '4px 0',
    boxShadow: '0px 1px 2px rgba(102, 115, 138, 0.25)',
    borderColor: 'transparent',
  }),

  placeholder: (provided) => ({
    ...provided,
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--iconDefault)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
  }),

  singleValue: (provided) => ({
    ...provided,
    fontSize: '16px',
    lineHeight: '24px',
    color: 'var(--fontColor)',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: '"Open Sans", "SansSerif", serif, "Manjari"',
  }),

  multiValueRemove: (provided, state) => ({
    ...provided,
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'white',
    },
    display: state.isDisabled ? 'none' : 'flex',
  }),

  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: '14px',
    lineHeight: '24px',
    color: 'white',
    padding: 0,
  }),
  multiValue: (provided, state) => ({
    ...provided,
    borderRadius: '32px',
    padding: state.isDisabled ? '0 18px 0 12px' : '0 4px 0 12px',
    border: '1px solid var(--teal700)',
    fontWeight: 600,
    backgroundColor: colors.teal600,
    minHeight: '26px',
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '8px',
    maxHeight: '144px',
    overflowY: 'scroll',
    '::-webkit-scrollbar': { display: 'none' },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    alignItems: 'flex-start',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    paddingTop: '14px',
    display: state.isDisabled ? 'none' : 'block',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  container: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? 'var(--inputDisabled)' : 'var(--bgInputListTile)',
  }),
};
