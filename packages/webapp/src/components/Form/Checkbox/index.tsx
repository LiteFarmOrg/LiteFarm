import React, { PropsWithChildren, ReactChildren, ReactEventHandler } from 'react';
import styles from './checkbox.module.scss';
import clsx from 'clsx';
import { Error, Main } from '../../Typography';
import { ReactComponent as PartiallyChecked } from '../../../assets/images/partially-checked.svg';
import { ReactComponent as UncheckedEnabled } from '../../../assets/images/unchecked-enabled.svg';
import { ReactComponent as CheckedEnabled } from '../../../assets/images/checked-enabled.svg';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  label?: string;
  disabled?: boolean;
  classes?: {
    checkbox?: object;
    label?: object;
    container?: object;
    error?: object;
  };
  style?: object;
  hookFormRegister?: {
    ref: React.RefObject<HTMLInputElement>;
    name: string;
    onChange: ReactEventHandler;
    onBlur: ReactEventHandler;
  };
  onChange?: ReactEventHandler;
  onBlur?: ReactEventHandler;
  sm?: boolean;
  partiallyChecked?: boolean;
  tooltipContent?: string;
  errors?: string;
}

const Checkbox = ({
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  onChange,
  onBlur,
  hookFormRegister,
  errors,
  sm,
  tooltipContent = undefined,
  partiallyChecked = false,
  ...props
}: PropsWithChildren<CheckboxProps>) => {
  const name = hookFormRegister?.name ?? props?.name;
  return (
    <label
      className={clsx(styles.container, disabled && styles.disabled)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      <input
        type={'checkbox'}
        ref={hookFormRegister?.ref}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          hookFormRegister?.onBlur(e);
        }}
        {...props}
        disabled={disabled}
      />
      {partiallyChecked ? (
        <PartiallyChecked className={styles.checked} />
      ) : (
        <CheckedEnabled className={styles.checked} />
      )}
      <UncheckedEnabled className={styles.unchecked} />
      <Main
        className={clsx(styles.label, sm && styles.smallLabel)}
        style={classes.label}
        tooltipContent={tooltipContent}
        data-cy="checkbox-component"
      >
        {label}
      </Main>
      {errors ? (
        <Error className={clsx(styles.error)} style={classes.error}>
          {errors}
        </Error>
      ) : null}
      {children}
    </label>
  );
};

export default Checkbox;
