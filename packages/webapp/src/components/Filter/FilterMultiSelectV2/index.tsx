import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import Select, {
  ClearIndicatorProps,
  components,
  MenuListProps,
  MultiValueRemoveProps,
  OptionProps,
} from 'react-select';
import { ComponentFilter } from '../types';
import { ReduxFilterEntity } from '../../../containers/Filter/types';
import { useState } from 'react';
import { ReactComponent as XCircle } from '../../../assets/images/x-circle.svg';
import { useTranslation } from 'react-i18next';
import TextButton from '../../Form/Button/TextButton';
import styles from './styles.module.scss';
import Checkbox from '../../Form/Checkbox';

interface FilterMultiSelectProps extends ComponentFilter {
  filterRef: React.RefObject<ReduxFilterEntity>;
}

const MultiValueRemove = (props: MultiValueRemoveProps) => (
  <components.MultiValueRemove {...props}>
    <XCircle />
  </components.MultiValueRemove>
);

const ClearIndicator = (props: ClearIndicatorProps) => {
  const { getValue, clearValue } = props;
  const value = getValue();
  const { t } = useTranslation();

  const onClick = (e) => {
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

const Option = (props: OptionProps) => {
  const { label, isSelected, selectOption, data } = props;

  const onClick = (e) => {
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

const MenuList = (props: MenuListProps) => {
  const { children } = props;
  return <components.MenuList {...props}>{children}</components.MenuList>;
};

export const FilterMultiSelectV2 = ({ options }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(() => options.filter((option) => option.default));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const hiddenCountRef = useRef<HTMLElement | null>(null);

  const sortedOptions = useMemo(() => {
    const sorted = [...options].sort((a, b) => {
      const isSelected = (option) => value.includes(option);
      return isSelected(b) - isSelected(a) || a.label.localeCompare(b.label);
    });
    return sorted;
  }, [options, value]);

  const onChange = (updatedValue) => {
    setValue(updatedValue.sort((a, b) => a.label.localeCompare(b.label)));
  };

  useLayoutEffect(() => {
    const pillElements = ref.current?.getElementsByClassName(styles.multiValue);
    if (pillElements) {
      const pillElementsArr = Array.from(pillElements) as HTMLElement[];
      const baseOffset = pillElementsArr[0]?.offsetTop;
      const hiddenCount = pillElementsArr.filter((el) => el.offsetTop > baseOffset).length;
      const lastVisiblePillIndex = pillElementsArr.length - hiddenCount - 1;
      pillElementsArr.forEach((el, index) => {
        if (index === lastVisiblePillIndex) {
          hiddenCountRef.current?.remove();
          if (hiddenCount > 0) {
            const newHiddenCountEl = document.createElement('p');
            newHiddenCountEl.textContent = `+${hiddenCount}`;
            hiddenCountRef.current = newHiddenCountEl;
            el.insertAdjacentElement('afterend', newHiddenCountEl);
          }
        }
        if (index > lastVisiblePillIndex) {
          el.classList.add(styles.hiddenPill);
        }
      });
    }
  });

  const onMenuOpen = () => {
    hiddenCountRef.current?.remove();
    setIsMenuOpen(true);
  };

  return (
    <div ref={ref}>
      <Select
        options={sortedOptions}
        value={value}
        isMulti
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        onChange={onChange}
        placeholder={t('FILTER.SHOWING_ALL')}
        onMenuOpen={onMenuOpen}
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
        }}
      />
    </div>
  );
};
