import React from 'react';
import styles from './radio.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Label } from '../../Typography';
import Leaf from '../../../assets/images/farmMapFilter/Leaf.svg';

const Radio = ({
  text,
  label = 'label',
  disabled = false,
  classes = {},
  children,
  style,
  optional,
  inputRef,
  img,
  ...props
}) => {
  return (
    <label>
      {text && (
        <Label style={{ marginBottom: '25px', fontSize: '16px', lineHeight: '25px' }}>
          {text}
          <img src={img} style={{ paddingLeft: '7px' }} />
          {optional && (
            <Label style={{ paddingLeft: '8px' }} sm>
              {optional}
            </Label>
          )}
        </Label>
      )}
      <label
        className={clsx(styles.container, disabled && styles.disabled)}
        style={(style || classes.container) && { ...style, ...classes.container }}
      >
        <input ref={inputRef} type={'radio'} {...props} disabled={disabled} />
        <p className={clsx(styles.label)} style={classes.label}>
          {label}
        </p>
        <span className={clsx(styles.checkmark)} style={classes.checkbox} />
        {children}
      </label>
    </label>
  );
};

Radio.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  classes: PropTypes.exact({
    checkbox: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default Radio;
