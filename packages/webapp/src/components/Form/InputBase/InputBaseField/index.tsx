import { ComponentPropsWithoutRef, ReactElement } from 'react';
import { type InputBaseProps } from '../';
import styles from './styles.module.scss';
import clsx from 'clsx';

function InputBaseField(
  props: Pick<InputBaseProps, 'leftSection' | 'rightSection'> & {
    crossIcon?: ReactElement;
    inputProps: ComponentPropsWithoutRef<'input'>;
  },
) {
  const showCross = !!props.crossIcon;
  return (
    <div className={clsx(styles.input, showCross && styles.inputError)}>
      {props.leftSection && (
        <div className={styles.inputSection} data-section="left">
          {props.leftSection}
        </div>
      )}
      <input {...props.inputProps} />
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
