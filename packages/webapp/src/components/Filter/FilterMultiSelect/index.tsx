import produce from 'immer';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../Form/ReactSelect';
import { ComponentFilter } from '../types';
import { ReduxFilterEntity, FilterState } from '../../../containers/Filter/types';
import type { FilterItemProps } from '../FilterGroup';

interface FilterMultiSelectProps extends ComponentFilter {
  filterRef: React.RefObject<ReduxFilterEntity>;
  style?: React.CSSProperties;
  shouldReset?: number;
  onChange?: FilterItemProps['onChange'];
  className?: string;
}

export const FilterMultiSelect = ({
  subject,
  filterKey,
  style,
  filterRef,
  shouldReset,
  options = [],
  onChange,
  className,
}: FilterMultiSelectProps) => {
  const { t } = useTranslation(['common']);

  const defaultValue = useMemo(() => {
    return options.filter((option) => option.default);
  }, []);
  const [value, setValue] = useState(defaultValue);

  const defaultFilterState = useMemo(() => {
    return options.reduce((defaultFilterState: FilterState, option) => {
      defaultFilterState[option.value] = {
        active: false,
        label: option.label,
      };
      return defaultFilterState;
    }, {});
  }, []);

  useEffect(() => {
    filterRef.current![filterKey] = produce(defaultFilterState, (defaultFilterState) => {
      for (const option of value) {
        defaultFilterState[option.value].active = true;
      }
    });
  }, [value]);

  useEffect(() => {
    if (shouldReset) {
      setValue([]);
    }
  }, [shouldReset]);

  return (
    <ReactSelect
      style={style}
      placeholder={`${t('common:SHOWING_ALL')}...`}
      options={options}
      label={subject}
      value={value}
      onChange={(value): void => {
        setValue([...value]);
        filterRef.current![filterKey] = produce(defaultFilterState, (defaultFilterState) => {
          for (const option of value) {
            defaultFilterState[option.value].active = true;
          }
        });

        onChange?.(filterRef.current![filterKey]);
      }}
      isMulti
      isSearchable
      className={className}
    />
  );
};

FilterMultiSelect.propTypes = {
  subject: PropTypes.string,
  options: PropTypes.array,
  filterKey: PropTypes.string,
  shouldReset: PropTypes.number,
  className: PropTypes.string,
};
