import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Radio from '../Radio';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function RadioGroup({
  style,
  hookFormControl,
  onChange,
  onBlur,
  name,
  required,
  shouldUnregister = true,
  showNotSure = false,
  radios,
  row = false,
  ...props
}) {
  const { t } = useTranslation();
  const validate = (value) => (required ? value !== undefined && value !== null : true);
  if (showNotSure && required) {
    console.error('showNotSure and required cannot be true at the same time');
  }
  const YES = showNotSure ? 'YES' : true;
  const NO = showNotSure ? 'NO' : false;
  const NOT_SURE = 'NOT_SURE';
  return (
    <div className={clsx(styles.container, row && styles.row)} style={style}>
      {!radios && (
        <>
          <Controller
            control={hookFormControl}
            name={name}
            rules={{ validate }}
            shouldUnregister={shouldUnregister}
            render={({ field }) => (
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
                  inputRef={field.ref}
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
                  inputRef={field.ref}
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
                    inputRef={field.ref}
                    value={NOT_SURE}
                    {...props}
                  />
                )}
              </>
            )}
          />
        </>
      )}
      {!!radios && (
        <Controller
          control={hookFormControl}
          name={name}
          rules={{ validate }}
          shouldUnregister={shouldUnregister}
          render={({ field }) =>
            radios.map((radioOptions) => (
              <Radio
                name={name}
                key={radioOptions.value}
                onChange={(e) => {
                  field?.onChange?.(e);
                  onChange?.(e);
                }}
                onBlur={(e) => {
                  field?.onBlur?.(e);
                  onBlur?.(e);
                }}
                inputRef={field.ref}
                value={field.value}
                {...props}
                {...radioOptions}
              />
            ))
          }
        />
      )}
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
      label: PropTypes.string,
      defaultChecked: PropTypes.bool,
      value: PropTypes.string,
    }),
  ),
};
