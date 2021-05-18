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
  defaultValue,
  row = false,
  ...props
}) {
  const { t } = useTranslation();
  const validate = (value) => (required ? value !== undefined && value !== null : true);
  if (showNotSure && required) {
    console.error('showNotSure and required cannot be true at the same time');
  }
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
                  defaultChecked={defaultValue === true}
                  onChange={(e) => {
                    field?.onChange?.(true);
                    onChange?.({ target: { value: true } });
                  }}
                  onBlur={(e) => {
                    field?.onBlur?.(true);
                    onBlur?.({ target: { value: true } });
                  }}
                  inputRef={field.ref}
                  value={true}
                  {...props}
                />
                <Radio
                  label={t('common:NO')}
                  name={name}
                  defaultChecked={defaultValue === false}
                  onChange={(e) => {
                    field?.onChange?.(false);
                    onChange?.({ target: { value: false } });
                  }}
                  onBlur={(e) => {
                    field?.onBlur?.(false);
                    onBlur?.({ target: { value: false } });
                  }}
                  inputRef={field.ref}
                  value={false}
                  {...props}
                />
                {showNotSure && (
                  <Radio
                    label={t('common:NOT_SURE')}
                    name={name}
                    onChange={(e) => {
                      field?.onChange?.(null);
                      onChange?.({ target: { value: null } });
                    }}
                    onBlur={(e) => {
                      field?.onBlur?.(null);
                      onBlur?.({ target: { value: null } });
                    }}
                    inputRef={field.ref}
                    value={undefined}
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
  defaultValue: PropTypes.bool,
  radios: PropTypes.arrayOf(
    PropTypes.shape({
      style: PropTypes.object,
      label: PropTypes.string,
      defaultChecked: PropTypes.bool,
      value: PropTypes.string,
    }),
  ),
};
