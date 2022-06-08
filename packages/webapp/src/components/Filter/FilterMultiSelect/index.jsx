import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ReactSelect from '../../Form/ReactSelect';
import produce from 'immer';
import { useTranslation } from 'react-i18next';

export const FilterMultiSelect = ({
  subject,
  filterKey,
  style,
  filterRef,
  shouldReset,
  options = [],
  onChange,
}) => {
  const { t } = useTranslation(['common']);

  const defaultValue = useMemo(() => {
    return options.filter((option) => option.default);
  }, []);
  const [value, setValue] = useState(defaultValue);

  const defaultFilterState = useMemo(() => {
    return options.reduce((defaultFilterState, option) => {
      defaultFilterState[option.value] = {
        active: false,
        label: option.label,
      };
      return defaultFilterState;
    }, {});
  }, []);

  useEffect(() => {
    if (shouldReset) {
      setValue([]);
    }
  }, [shouldReset]);

  useEffect(() => {
    filterRef.current[filterKey] = produce(defaultFilterState, (defaultFilterState) => {
      for (const option of value) {
        defaultFilterState[option.value].active = true;
      }
    });
  }, [value]);

  return (
    <ReactSelect
      style={style}
      placeholder={`${t('common:SELECT')}...`}
      options={options}
      label={subject}
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange?.(value);
      }}
      isMulti
    />
  );
};

FilterMultiSelect.prototype = {
  subject: PropTypes.string,
  options: PropTypes.array,
  filterKey: PropTypes.string,
  shouldReset: PropTypes.number,
};
