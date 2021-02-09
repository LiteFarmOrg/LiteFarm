import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import styles from './form.module.scss';

const Form = ({
  classes = { footer: { padding: '24px 16px 24px 16px', position: 'relative' } },
  children,
  buttonGroup,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Layout buttonGroup={buttonGroup} children={children} classes={classes} isSVG={false} />
    </form>
  );
};

Form.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.exact({
    container: PropTypes.object,
    footer: PropTypes.object,
  }),
  onSubmit: PropTypes.func,
};

export default Form;
