import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import RadioGroup from '../Form/RadioGroup';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import Input, { getInputErrors } from '../Form/Input';
import Unit from '../Form/Unit';

export function PersistedFormWrapper({ children }) {
  const [hookFormPersistUnMountResolved, setHookFormPersistUnMountResolved] = useState();
  useEffect(() => setHookFormPersistUnMountResolved(true), []);
  return <>{hookFormPersistUnMountResolved && children}</>;
}

export function LabeledRadioRow({
  label,
  hasLeaf,
  name,
  isViewLocationPage,
  radios,
  required = false,
  leftJustified = true,
}) {
  const { control } = useFormContext();
  const { t } = useTranslation();
  const radiosWithTranslatedLabels = radios?.map((radio) => ({
    label: t(radio.labelKey),
    value: radio.value,
  }));
  return (
    <div style={{ marginBottom: '16px' }}>
      <InputBaseLabel
        label={label}
        hasLeaf={hasLeaf}
        optional={!required}
        labelStyles={{
          marginBottom: '12px',
          fontSize: '16px',
        }}
        leftJustified={leftJustified}
      />
      <RadioGroup
        row={!radios}
        disabled={isViewLocationPage}
        name={name}
        hookFormControl={control}
        radios={radiosWithTranslatedLabels}
        required={required}
      />
    </div>
  );
}

export function OrganicTypeSelector({ enumKeys, labelKey, isViewLocationPage }) {
  const { t } = useTranslation();
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext();
  const selection = watch(enumKeys.organic_status);
  const [transitionalDate, setTransitionalDate] = useState(watch(enumKeys.transition_date));

  return (
    <>
      <LabeledRadioRow
        label={t(`FARM_MAP.${labelKey}.${labelKey}_TYPE`)}
        hasLeaf
        name={enumKeys.organic_status}
        isViewLocationPage={isViewLocationPage}
        radios={[
          { labelKey: `FARM_MAP.${labelKey}.NON_ORGANIC`, value: 'Non-Organic' },
          { labelKey: `FARM_MAP.${labelKey}.ORGANIC`, value: 'Organic' },
          { labelKey: `FARM_MAP.${labelKey}.TRANSITIONING`, value: 'Transitional' },
        ]}
        required
      />
      {selection === 'Transitional' && (
        <Input
          style={{ marginTop: '-8px' }}
          type="date"
          label={t(`FARM_MAP.${labelKey}.DATE`)}
          hookFormRegister={register(enumKeys.transition_date, { required: true })}
          disabled={isViewLocationPage}
          onChange={(e) => setTransitionalDate(e.target.value)}
          value={transitionalDate}
          //TODO: Check this should not be present on Field or greenhouse
          errors={getInputErrors(errors, enumKeys.transition_date)}
        />
      )}
    </>
  );
}

export function UnitField({
  enumKey,
  label,
  displayUnitName,
  unitType,
  system,
  required,
  disabled,
  classes,
  style,
}) {
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Unit
      register={register}
      classes={{
        container: { flexGrow: 1, marginBottom: '16px' },
        ...classes,
      }}
      style={style}
      label={label}
      name={enumKey}
      displayUnitName={displayUnitName}
      errors={errors[enumKey]}
      unitType={unitType}
      system={system}
      hookFormSetValue={setValue}
      hookFormGetValue={getValues}
      hookFromWatch={watch}
      control={control}
      required={required}
      disabled={disabled}
    />
  );
}
