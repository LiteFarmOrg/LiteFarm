import React, { Component, MouseEvent, RefObject, useLayoutEffect, useMemo, useRef } from 'react';
import Select, {
  ClearIndicatorProps,
  components,
  MenuListProps,
  MultiValue,
  MultiValueRemoveProps,
  OptionProps,
} from 'react-select';
import { ComponentFilter, ComponentFilterOption } from '../types';
import { ReduxFilterEntity } from '../../../containers/Filter/types';
import { useState } from 'react';
import { ReactComponent as XCircle } from '../../../assets/images/x-circle.svg';
import { useTranslation } from 'react-i18next';
import TextButton from '../../Form/Button/TextButton';
import styles from './styles.module.scss';
import Checkbox from '../../Form/Checkbox';
import produce from 'immer';
import { FilterItemProps } from '../FilterGroup';

interface FilterMultiSelectV2Props extends ComponentFilter {
  onChange?: FilterItemProps['onChange'];
}

const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <components.MultiValueRemove {...props}>
    <XCircle />
  </components.MultiValueRemove>
);

const ClearIndicator = (props: ClearIndicatorProps<ComponentFilterOption>) => {
  const { getValue, clearValue } = props;
  const value = getValue();
  const { t } = useTranslation();

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clearValue();
  };

  return (
    <>
      {t('FILTER.SELECTED', { count: value.length })} -
      <TextButton className={styles.clearTextButton} onClick={onClick}>
        clear
      </TextButton>
    </>
  );
};

const Option = (props: OptionProps<ComponentFilterOption>) => {
  const { label, isSelected, selectOption, data } = props;

  const onClick = (e: MouseEvent) => {
    selectOption(data);
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <components.Option {...props}>
      <TextButton className={styles.optionButton} onClick={onClick}>
        <Checkbox label={label} checked={isSelected} />
      </TextButton>
    </components.Option>
  );
};

const MenuList = (props: MenuListProps<ComponentFilterOption>) => {
  const { children, getValue, hasValue, options, clearValue } = props;
  const { t } = useTranslation();

  const partiallyChecked = getValue().length !== options.length;

  return (
    <components.MenuList {...props}>
      <div className={styles.option}>
        <TextButton className={styles.optionButton} onClick={clearValue}>
          <Checkbox
            label={t('FILTER.SHOWING_ALL')}
            checked={hasValue}
            partiallyChecked={partiallyChecked}
          />
        </TextButton>
      </div>
      {children}
    </components.MenuList>
  );
};

export const FilterMultiSelectV2 = ({ options, onChange }: FilterMultiSelectV2Props) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(() => options.filter((option) => option.default));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const hiddenCountRef = useRef<HTMLElement | null>(null);

  const sortedOptions = useMemo(() => {
    const sorted = [...options].sort((a, b) => {
      const isSelected = (option: ComponentFilterOption) => value.includes(option);
      return Number(isSelected(b)) - Number(isSelected(a)) || a.label.localeCompare(b.label);
    });
    return sorted;
  }, [options, value]);

  const defaultFilterState = useMemo(() => {
    return options.reduce(
      (defaultFilterState: Record<string, { active: boolean; label: string }>, option) => {
        defaultFilterState[option.value] = {
          active: false,
          label: option.label,
        };
        return defaultFilterState;
      },
      {},
    );
  }, []);

  const handleChange = (updatedValue: MultiValue<ComponentFilterOption>) => {
    setValue([...updatedValue].sort((a, b) => a.label.localeCompare(b.label)));
    onChange?.(
      produce(defaultFilterState, (defaultFilterState) => {
        for (const option of updatedValue) {
          defaultFilterState[option.value].active = true;
        }
      }),
    );
  };

  useLayoutEffect(() => {
    hiddenCountRef.current?.remove();
    const pillElements = ref.current?.getElementsByClassName(styles.multiValue);
    if (pillElements) {
      const pillElementsArr = Array.from(pillElements) as HTMLElement[];
      const baseOffset = pillElementsArr[0]?.offsetTop;
      const hiddenCount = pillElementsArr.filter((el) => el.offsetTop > baseOffset).length;
      const lastVisiblePillIndex = pillElementsArr.length - hiddenCount - 1;
      pillElementsArr.forEach((el, index) => {
        if (index === lastVisiblePillIndex && hiddenCount > 0) {
          const newHiddenCountEl = document.createElement('p');
          newHiddenCountEl.textContent = `+${hiddenCount}`;
          hiddenCountRef.current = newHiddenCountEl;
          el.insertAdjacentElement('afterend', newHiddenCountEl);
        }
        if (index > lastVisiblePillIndex) {
          el.classList.add(styles.hiddenPill);
        }
      });
    }
  });

  return (
    <div ref={ref}>
      <Select
        // menuIsOpen
        options={sortedOptions}
        value={value}
        isMulti
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        onChange={handleChange}
        placeholder={t('FILTER.SHOWING_ALL_DEFAULT')}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        controlShouldRenderValue={!isMenuOpen}
        isSearchable={isMenuOpen}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: 'var(--grey200)',
            primary25: 'var(--Colors-Secondary-Secondary-green-500)',
          },
        })}
        classNames={{
          multiValue: () => styles.multiValue,
          multiValueLabel: () => styles.multiValueLabel,
          multiValueRemove: () => styles.multiValueRemove,
          option: () => styles.option,
          placeholder: () => styles.placeholder,
          dropdownIndicator: () => styles.dropdownIndicator,
          control: (state) => (state.isFocused ? styles.focusedControl : styles.control),
          indicatorsContainer: () => styles.indicatorsContainer,
        }}
        components={{
          MultiValueRemove,
          IndicatorSeparator: null,
          ClearIndicator,
          Option,
          MenuList,
        }}
      />
    </div>
  );
};
