import { ComponentPropsWithoutRef, ReactElement, useRef } from 'react';
import { type InputBaseProps } from '../';
import styles from './styles.module.scss';
import clsx from 'clsx';

function InputBaseField(
  props: Pick<InputBaseProps, 'leftSection' | 'rightSection'> & {
    crossIcon?: ReactElement;
    inputProps: ComponentPropsWithoutRef<'input'>;
  },
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const showCross = !!props.crossIcon;
  return (
    <div
      onMouseDown={(e) => document.activeElement === inputRef.current && e.preventDefault()}
      className={clsx(
        styles.input,
        showCross && styles.inputError,
        props.inputProps.disabled && styles.inputDisabled,
      )}
    >
      {props.leftSection && (
        <div className={styles.inputSection} data-section="left">
          {props.leftSection}
        </div>
      )}
      <input {...props.inputProps} ref={inputRef} />
      {(showCross || props.rightSection) && (
        <div className={styles.inputSection} data-section="right">
          {props.rightSection}
          {props.crossIcon}
        </div>
      )}
    </div>
  );
}

export default InputBaseField;
