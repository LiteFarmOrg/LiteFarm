import React, { useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Radio from '../Radio';
import { useController } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function RadioGroup({
  style,
  hookFormControl,
  onChange,
  onBlur,
  name,
  required,
  shouldUnregister = false,
  showNotSure = false,
  radios,
  row = false,
  ...props
}) {
  const { t } = useTranslation();
  const validate = (value) => (required ? value !== undefined && value !== null : true);

  const { field } = useController({
    name,
    control: hookFormControl,
    rules: { validate },
    shouldUnregister,
  });
  //TODO: create issue on HookForm
  useEffect(() => {
    field.onChange(field.value);
  }, []);

  const YES = showNotSure ? 'YES' : true;
  const NO = showNotSure ? 'NO' : false;
  const NOT_SURE = 'NOT_SURE';
  return (
    <div className={clsx(styles.container, row && styles.row)} style={style}>
      {!radios && (
        <>
          <>
            <Radio
              label={t('common:YES')}
              name={name}
              checked={field.value === YES}
              onChange={(e) => {
                field?.onChange?.(YES);
                onChange?.({ target: { value: YES } });
              }}
              onBlur={(e) => {
                field?.onBlur?.(YES);
                onBlur?.({ target: { value: YES } });
              }}
              value={YES}
              {...props}
            />
            <Radio
              label={t('common:NO')}
              name={name}
              checked={field.value === NO}
              onChange={(e) => {
                field?.onChange?.(NO);
                onChange?.({ target: { value: NO } });
              }}
              onBlur={(e) => {
                field?.onBlur?.(NO);
                onBlur?.({ target: { value: NO } });
              }}
              value={NO}
              {...props}
            />
            {showNotSure && (
              <Radio
                label={t('common:NOT_SURE')}
                name={name}
                checked={field.value === NOT_SURE}
                onChange={(e) => {
                  field?.onChange?.(NOT_SURE);
                  onChange?.({ target: { value: NOT_SURE } });
                }}
                onBlur={(e) => {
                  field?.onBlur?.(NOT_SURE);
                  onBlur?.({ target: { value: NOT_SURE } });
                }}
                value={NOT_SURE}
                {...props}
              />
            )}
          </>
        </>
      )}
      {!!radios &&
        radios.map((radioOptions) => (
          <Radio
            name={name}
            key={radioOptions.value}
            checked={field.value === radioOptions.value}
            onChange={(e) => {
              field?.onChange?.(radioOptions.value);
              onChange?.({ target: { value: radioOptions.value } });
            }}
            onBlur={(e) => {
              field?.onBlur?.(radioOptions.value);
              onBlur?.({ target: { value: radioOptions.value } });
            }}
            value={field.value}
            {...props}
            {...radioOptions}
          />
        ))}
    </div>
  );
}

RadioGroup.propTypes = {
  style: PropTypes.object,
  hookFormControl: PropTypes.object,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  shouldUnregister: PropTypes.bool,
  required: PropTypes.bool,
  showNotSure: PropTypes.bool,
  radios: PropTypes.arrayOf(
    PropTypes.shape({
      style: PropTypes.object,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      defaultChecked: PropTypes.bool,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    }),
  ),
};
