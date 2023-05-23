import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import ReactSelect from '../../Form/ReactSelect';
import { Controller } from 'react-hook-form';
import { getFieldWorkTypes } from '../../../containers/Task/FieldWorkTask/saga';
import { useDispatch, useSelector } from 'react-redux';
import { fieldWorkSliceSliceSelector } from '../../../containers/fieldWorkSlice';

const formatDefaultTypeValue = (typeValue, fieldWorkTypeOptions) => {
  const option = fieldWorkTypeOptions.filter(({ field_work_type_id }) => {
    return field_work_type_id === typeValue[0].field_work_type_id;
  });
  if (option.length) {
    return option[0];
  }

  // This is for a task with a brand-new custom type.
  // The new type has not been added to "fieldWorkTypeOptions" by the time this function gets called.
  const [{ farm_id, field_work_name, field_work_type_id, field_work_type_translation_key }] =
    typeValue;
  return {
    field_work_type_id,
    farm_id,
    label: field_work_name,
    value: field_work_type_translation_key,
    field_work_name,
  };
};

const PureFieldWorkTask = ({ register, control, setValue, watch, disabled = false }) => {
  const { t } = useTranslation();

  const fieldWorkTypes = useSelector(fieldWorkSliceSliceSelector)?.fieldWorkTypes || [];
  const dispatch = useDispatch();
  const [fieldWorkTypeOptions, setFieldWorkTypeOptions] = useState([]);

  const FIELD_WORK_TYPE = 'field_work_task.field_work_task_type';
  const typeValue = watch(FIELD_WORK_TYPE);
  const FIELD_WORK_OTHER_TYPE = 'field_work_task.field_work_task_type.field_work_name';
  const fieldWorkTypeExposedValue = useMemo(() => {
    return typeValue?.value
      ? typeValue
      : {
          label: t(`ADD_TASK.FIELD_WORK_VIEW.TYPE.${typeValue}`),
          value: typeValue,
        };
  }, [typeValue]);
  useEffect(() => {
    if (fieldWorkTypeExposedValue?.value !== 'OTHER') setValue(FIELD_WORK_OTHER_TYPE, null);
  }, [fieldWorkTypeExposedValue]);

  useEffect(() => {
    // Go through the field work types and add the translation to the label
    // Match the value to the field_work_type_id if it is a default type otherwise to its value
    const options = fieldWorkTypes
      .map((type) => ({
        ...type,
        label: !type.farm_id ? t(type.label) : type.field_work_name,
        value: !type.farm_id ? type.field_work_type_id : type.value,
      }))
      .concat({ label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.OTHER'), value: 'OTHER' });
    setFieldWorkTypeOptions(options);
  }, [fieldWorkTypes]);

  useEffect(() => {
    dispatch(getFieldWorkTypes());
  }, []);

  useEffect(() => {
    if (typeValue?.length && fieldWorkTypeOptions?.length) {
      // in read-only and before_complete views, default typeValue is an array which needs to be formatted.
      setValue(FIELD_WORK_TYPE, formatDefaultTypeValue(typeValue, fieldWorkTypeOptions));
    }
  }, [typeValue, fieldWorkTypeOptions]);

  return (
    <>
      <Controller
        control={control}
        name={FIELD_WORK_TYPE}
        rules={{ validate: (option) => !!option.value }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            data-cy="fieldWorkTask-typeSelect"
            label={t('ADD_TASK.FIELD_WORK_VIEW.TYPE_OF_FIELD_WORK')}
            options={fieldWorkTypeOptions}
            style={{ marginBottom: '24px' }}
            onChange={(e) => {
              onChange(e);
              setValue(FIELD_WORK_TYPE, e, { shouldValidate: true });
            }}
            isDisabled={disabled}
            value={value}
          />
        )}
      />
      {fieldWorkTypeExposedValue?.value === 'OTHER' && (
        <Input
          data-cy="fieldWork-customTask"
          label={t('ADD_TASK.FIELD_WORK_VIEW.OTHER_TYPE_OF_FIELD_WORK')}
          style={{ marginBottom: '20px' }}
          name={FIELD_WORK_OTHER_TYPE}
          disabled={disabled}
          hookFormRegister={register(FIELD_WORK_OTHER_TYPE, { required: true })}
        />
      )}
    </>
  );
};

export default PureFieldWorkTask;
