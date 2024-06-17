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

import { Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import {
  ClearIndicatorProps,
  DropdownIndicatorProps,
  GroupBase,
  MultiValueRemoveProps,
  components,
} from 'react-select';
import { colors } from '../../../assets/theme';
import { BsX } from 'react-icons/bs';
import { ReactComponent as SearchIcon } from '../../../assets/images/search.svg';

function ClearIndicator<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ innerProps, isMulti }: ClearIndicatorProps<Option, IsMulti, Group>) {
  const { t } = useTranslation();
  return (
    <Underlined
      {...innerProps}
      style={{
        position: 'absolute',
        right: 0,
        bottom: '-20px',
        color: colors.brown700,
      }}
    >
      {t(`REACT_SELECT.${isMulti ? 'CLEAR_ALL' : 'CLEAR'}`)}
    </Underlined>
  );
}

function MultiValueRemove<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({ innerProps }: MultiValueRemoveProps<Option, IsMulti, Group>) {
  return (
    <div {...innerProps}>
      <BsX />
    </div>
  );
}

function MenuOpenDropdownIndicator<T>(props: DropdownIndicatorProps<T>) {
  if (props.selectProps.menuIsOpen && props.selectProps.isSearchable)
    return (
      <components.DropdownIndicator {...props}>
        <SearchIcon />
      </components.DropdownIndicator>
    );

  return <components.DropdownIndicator {...props} />;
}
export { ClearIndicator, MultiValueRemove, MenuOpenDropdownIndicator };
