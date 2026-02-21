/*
 *  Copyright 2026 LiteFarm.org
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

import { MouseEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, {
  ClearIndicatorProps,
  components,
  MenuListProps,
  MultiValue,
  MultiValueRemoveProps,
  OptionProps,
  Theme,
} from 'react-select';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { ReactComponent as XCircle } from '../../../../assets/images/x-circle.svg';
import TextButton from '../../Button/TextButton';
import Checkbox from '../../Checkbox';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface CheckboxMultiSelectProps {
  options: SelectOption[];
  value: SelectOption[];
  onChange: (newValue: MultiValue<SelectOption>) => void;
  isDisabled?: boolean;
  placeholder?: string;
  showSelectionStatus?: boolean;
}

const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <components.MultiValueRemove {...props}>
    <XCircle />
  </components.MultiValueRemove>
);

const ClearIndicator = (props: ClearIndicatorProps<SelectOption>) => {
  const { getValue } = props;
  const value = getValue();
  const { t } = useTranslation();

  return (
    <>
      <span className={styles.selectedCountText}>
        {t('FILTER.SELECTED', { count: value.length })} -
      </span>
      <components.ClearIndicator {...props}>
        <TextButton className={styles.clearTextButton}>{t('FILTER.CLEAR')}</TextButton>
      </components.ClearIndicator>
    </>
  );
};

const Option = (props: OptionProps<SelectOption>) => {
  const { label, isSelected, selectOption, data } = props;

  const onClick = (e: MouseEvent) => {
    selectOption(data);
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <components.Option {...props}>
      <TextButton className={styles.optionButton} onClick={onClick}>
        <Checkbox label={label} checked={isSelected} shouldBoldSelected={false} />
      </TextButton>
    </components.Option>
  );
};

const MenuListWithStatusHeader = (props: MenuListProps<SelectOption>) => {
  const { t } = useTranslation();
  const { children, getValue, hasValue, options } = props;
  const partiallyChecked = hasValue && getValue().length !== options.length;
  const allChecked = getValue().length === options.length;

  return (
    <components.MenuList {...props}>
      <div className={clsx(styles.option, styles.showingAll)}>
        <Checkbox
          label={t('FILTER.SHOWING_ALL')}
          checked={!hasValue || partiallyChecked || allChecked}
          partiallyChecked={partiallyChecked}
          shouldBoldSelected={false}
        />
      </div>
      {children}
    </components.MenuList>
  );
};

const theme = (theme: Theme): Theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: 'var(--grey200)',
    primary25: 'var(--Colors-Secondary-Secondary-green-500)',
  },
});

const classNames = {
  menuPortal: () => styles.menuPortal,
  multiValue: () => styles.multiValue,
  multiValueLabel: () => styles.multiValueLabel,
  multiValueRemove: () => styles.multiValueRemove,
  option: () => styles.option,
  placeholder: () => styles.placeholder,
  dropdownIndicator: () => styles.dropdownIndicator,
  control: (state: { isFocused: boolean }) =>
    state.isFocused ? styles.focusedControl : styles.control,
  indicatorsContainer: () => styles.indicatorsContainer,
  valueContainer: () => styles.valueContainer,
};

export const CheckboxMultiSelect = ({
  options,
  value,
  onChange,
  isDisabled = false,
  placeholder,
  showSelectionStatus = true,
}: CheckboxMultiSelectProps) => {
  const { t } = useTranslation();
  const defaultPlaceholder = t('common:SELECT') + '...';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const hiddenCountRef = useRef<HTMLElement | null>(null);

  const sortedOptions = useMemo(() => {
    const sorted = [...options].sort((a, b) => {
      const isSelected = (option: SelectOption) =>
        value.some((item) => item.label === option.label);
      return Number(isSelected(b)) - Number(isSelected(a)) || a.label?.localeCompare(b.label);
    });
    return sorted;
  }, [options, value]);

  // Every time there will be a re-render, do re-calculation to show hidden pills count
  useLayoutEffect(() => {
    // Remove previous hidden pills count
    hiddenCountRef.current?.remove();

    // Find pill elements and container element
    const pillElements = ref.current?.getElementsByClassName(styles.multiValue);
    const valueContainer = ref.current?.getElementsByClassName(styles.valueContainer)?.[0];

    if (pillElements && valueContainer) {
      // Add spacing to account for the space the hidden pills count will take once added
      valueContainer.classList.add(styles.hiddenPillsCountSpacing);

      const pillElementsArr = Array.from(pillElements) as HTMLElement[];

      // Un-hide previously hidden pills
      pillElementsArr.forEach((el) => el.classList.remove(styles.hiddenPill));

      // Calculate where the top of the first pill is situated
      const baseOffset = pillElementsArr[0]?.offsetTop;
      // Calculate how many pills have their top border below that base (how many are in a new line)
      const hiddenCount = pillElementsArr.filter((el) => el.offsetTop > baseOffset).length;
      // Get last pill in first line
      const lastVisiblePillIndex = pillElementsArr.length - hiddenCount - 1;

      pillElementsArr.forEach((el, index) => {
        if (index === lastVisiblePillIndex && hiddenCount > 0) {
          // Add hidden pills count next to last pill in first line
          const newHiddenCountEl = document.createElement('p');
          newHiddenCountEl.textContent = `+${hiddenCount}`;
          hiddenCountRef.current = newHiddenCountEl;
          el.insertAdjacentElement('afterend', newHiddenCountEl);
        }
        if (index > lastVisiblePillIndex) {
          // Hide overflowing pills
          el.classList.add(styles.hiddenPill);
        }
      });

      // Remove extra spacing
      valueContainer.classList.remove(styles.hiddenPillsCountSpacing);
    }
  });

  return (
    <div ref={ref}>
      <Select
        options={sortedOptions}
        value={value}
        isMulti
        isDisabled={isDisabled}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        blurInputOnSelect={false} // https://github.com/JedWatson/react-select/issues/3893
        onChange={onChange}
        placeholder={!isMenuOpen && (placeholder ?? defaultPlaceholder)}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        controlShouldRenderValue={!isMenuOpen}
        isSearchable={isMenuOpen}
        menuPortalTarget={document.body}
        menuPlacement="auto"
        theme={theme}
        classNames={classNames}
        components={{
          MultiValueRemove,
          IndicatorSeparator: null,
          ClearIndicator,
          Option,
          MenuList: showSelectionStatus ? MenuListWithStatusHeader : components.MenuList,
        }}
      />
    </div>
  );
};
