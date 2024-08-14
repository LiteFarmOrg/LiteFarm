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

import React from 'react';
import Select, { CreatableProps } from 'react-select/creatable';
import { GroupBase, SelectInstance } from 'react-select';
import { styles as baseStyles } from './styles';
import InputBaseLabel, { InputBaseLabelProps } from '../InputBase/InputBaseLabel';
import { useTranslation } from 'react-i18next';
import { ClearIndicator, MultiValueRemove, MenuOpenDropdownIndicator } from './components';
import scss from './styles.module.scss';

type CreatableSelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = CreatableProps<Option, IsMulti, Group> &
  InputBaseLabelProps & {
    createPromptText?: string;
    style?: React.CSSProperties;
  };

// component type with ref
type CreateableSelect = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: CreatableSelectProps<Option, IsMulti, Group> &
    React.RefAttributes<SelectInstance<Option, IsMulti, Group>>,
) => React.ReactElement;

const CreatableSelect = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    label,
    toolTipContent,
    icon,
    hasLeaf,
    style,
    styles,
    optional,
    components,
    createPromptText = t('common:CREATE'),
    placeholder = t('common:SELECT') + '...',
    ...restProps
  } = props;

  const isValidNewOption = (inputValue: string) => {
    return inputValue.trim().length > 0;
  };

  return (
    <div data-cy="react-select" className={scss.container} style={style}>
      {(label || toolTipContent || icon) && (
        <InputBaseLabel
          label={label}
          optional={optional}
          hasLeaf={hasLeaf}
          toolTipContent={toolTipContent}
          icon={icon}
        />
      )}
      <Select
        menuPortalTarget={document.body}
        isSearchable
        isClearable
        placeholder={placeholder}
        formatCreateLabel={(userInput) => `${createPromptText} "${userInput}"`}
        isValidNewOption={isValidNewOption}
        styles={{
          ...(baseStyles as any),
          ...styles,
        }}
        components={{
          ClearIndicator,
          MultiValueRemove,
          DropdownIndicator: MenuOpenDropdownIndicator,
          ...components,
        }}
        ref={ref}
        {...restProps}
      />
    </div>
  );
}) as CreateableSelect;

export { CreatableSelect };
