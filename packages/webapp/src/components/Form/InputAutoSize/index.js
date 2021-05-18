import PropTypes from 'prop-types';
import {Error, Label} from '../../Typography';
import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { mergeRefs } from '../utils';
import { TextareaAutosize } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function InputAutoSize({
  classes = {},
  rowsMax = 4,
  rowsMin = 1,
  style,
  label,
  hookFormRegister,
  onBlur,
  optional,
  onChange,
  errors,
  ...props
}) {
  const input = useRef();
  const name = hookFormRegister?.name ?? props?.name;
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div
      className={clsx(styles.container)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {label && <Label>{label}
      {optional && (
        <Label sm className={styles.sm} style={{ marginLeft: '4px' }}>
          {t('common:OPTIONAL')}
        </Label>
      )}</Label>}

      <TextareaAutosize
        rowsMax={rowsMax}
        rowsMin={rowsMin}
        name={name}
        className={clsx(styles.textArea, errors && styles.inputError)}

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
      {errors ? <Error style={classes.errors}>{errors}</Error> : null}
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
  optional: PropTypes.bool,
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};
