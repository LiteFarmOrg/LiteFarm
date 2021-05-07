import PropTypes from 'prop-types';
import { Label } from '../../Typography';
import React, { useRef } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { mergeRefs } from '../utils';
import { TextareaAutosize } from '@material-ui/core';

export default function InputAutoSize({
  classes = {},
  rowsMax = 4,
  rowsMin,
  style,
  label,
  hookFormRegister,
  onBlur,
  onChange,
  ...props
}) {
  const input = useRef();
  const name = hookFormRegister?.name ?? props?.name;

  return (
    <div
      className={clsx(styles.container)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {label && <Label>{label}</Label>}
      <TextareaAutosize
        rowsMax={rowsMax}
        rowsMin={rowsMin}
        name={name}
        className={clsx(styles.textArea)}
        ref={mergeRefs(hookFormRegister?.ref, input)}
        onChange={(e) => {
          onChange?.(e);
          hookFormRegister?.onChange(e);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          hookFormRegister?.onBlur(e);
        }}
        {...props}
      />
    </div>
  );
}

InputAutoSize.propTypes = {
  label: PropTypes.string,
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
  }),
  hookFormRegister: PropTypes.exact({
    ref: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    name: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  style: PropTypes.object,
  rowsMin: PropTypes.number,
  rowsMax: PropTypes.number,
};
