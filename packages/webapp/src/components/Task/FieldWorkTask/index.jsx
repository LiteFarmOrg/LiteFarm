import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import ReactSelect from '../../Form/ReactSelect';
import { Controller } from 'react-hook-form';

const PureFieldWorkTask = ({
  register,
  control,
  setValue,
  // getValues,
  watch,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const FIELD_WORK_TYPE = 'field_work_task.type';
  const typeValue = watch(FIELD_WORK_TYPE);
  const FIELD_WORK_OTHER_TYPE = 'field_work_task.other_type';
  const fieldWorkTypeOptions = [
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.COVERING_SOIL'), value: 'COVERING_SOIL' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.FENCING'), value: 'FENCING' },
    {
      label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.PREPARING_BEDS_OR_ROWS'),
      value: 'PREPARING_BEDS_OR_ROWS',
    },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.PRUNING'), value: 'PRUNING' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.SHADE_CLOTH'), value: 'SHADE_CLOTH' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.TERMINATION'), value: 'TERMINATION' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.TILLAGE'), value: 'TILLAGE' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.WEEDING'), value: 'WEEDING' },
    { label: t('ADD_TASK.FIELD_WORK_VIEW.TYPE.OTHER'), value: 'OTHER' },
  ];
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
  return (
    <>
      <Controller
        control={control}
        name={FIELD_WORK_TYPE}
        rules={{ required: true }}
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
            value={
              // TODO: refactor value reading here and in pest control
              // this solution keeps placeholder while accommodating the read-only view
              !value
                ? value
                : value?.value
                ? value
                : { value, label: t(`ADD_TASK.FIELD_WORK_VIEW.TYPE.${value}`) }
            }
          />
        )}
      />
      {fieldWorkTypeExposedValue?.value === 'OTHER' && (
        <Input
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
