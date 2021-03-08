import React, { useRef } from 'react';
import styles from './textarea.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Label } from '../../Typography';

import { mergeRefs } from '../utils';

const TextArea = ({ classes = {}, style, label, inputRef, ...props }) => {
  const input = useRef();
  return (
    <div
      className={clsx(styles.container)}
      style={(style || classes.container) && { ...style, ...classes.container }}
    >
      {label && <Label>{label}</Label>}
      <textarea className={clsx(styles.textArea)} ref={mergeRefs(inputRef, input)} {...props} />
    </div>
  );
};

TextArea.propTypes = {
  label: PropTypes.string,
  classes: PropTypes.exact({
    input: PropTypes.object,
    label: PropTypes.object,
    container: PropTypes.object,
    info: PropTypes.object,
  }),
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  style: PropTypes.object,
};

export default TextArea;
