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
import ReactSelect, { SelectInstance, Props, GroupBase } from 'react-select';
import { useTranslation } from 'react-i18next';
import InputBaseLabel, { type InputBaseLabelProps } from '../InputBase/InputBaseLabel';
import { styles as baseStyles } from './styles';
import scss from './styles.module.scss';
import { ClearIndicator, MultiValueRemove } from './components';

type SelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = Props<Option, IsMulti, Group> &
  InputBaseLabelProps & {
    style?: React.CSSProperties;
  };

// component type with ref
type Select = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: SelectProps<Option, IsMulti, Group> &
    React.RefAttributes<SelectInstance<Option, IsMulti, Group>>,
) => React.ReactElement;

const Select = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    label,
    toolTipContent,
    icon,
    optional,
    hasLeaf,
    isDisabled,
    options,
    isSearchable,
    components,
    defaultValue,
    style,
    styles,
    placeholder = t('common:SELECT') + '...',
    ...restProps
  } = props;

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
      <ReactSelect
        menuPortalTarget={document.body}
        styles={{
          ...(baseStyles as any),
          ...styles,
        }}
        placeholder={placeholder}
        options={options}
        components={{
          ClearIndicator,
          MultiValueRemove,
          ...components,
        }}
        isSearchable={isSearchable ?? (options?.length ?? 0) > 8}
        ref={ref}
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        {...restProps}
      />
    </div>
  );
}) as Select;

export default Select;
