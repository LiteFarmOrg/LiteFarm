import clsx from 'clsx';
import PropTypes from 'prop-types';
import { ComponentPropsWithoutRef } from 'react';
import styles from './styles.module.scss';

export default function PureFilePickerWrapper({
  children,
  className,
  style,
  disabled,
  onChange,
  ...props
}: ComponentPropsWithoutRef<'input'>) {
  return (
    <div className={clsx(styles.inputContainer, className)} style={style}>
      <input
        type="file"
        size={1}
        className={styles.input}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {children}
    </div>
  );
}

PureFilePickerWrapper.propTypes = {
  disabled: PropTypes.bool,
  style: PropTypes.object,
  onChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};
