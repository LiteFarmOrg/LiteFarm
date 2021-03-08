import React from 'react';
import PropTypes from 'prop-types';
import styles from './form.module.scss';
import TitleLayout from '../Layout/TitleLayout';

const FormTitleLayout = ({
  classes = { footer: { padding: '24px 16px 24px 16px', position: 'relative' } },
  children,
  buttonGroup,
  onSubmit,
  onGoBack = null,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <TitleLayout
        buttonGroup={buttonGroup}
        children={children}
        classes={classes}
        onGoBack={onGoBack}
      />
    </form>
  );
};

FormTitleLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.exact({
    container: PropTypes.object,
    footer: PropTypes.object,
  }),
  onSubmit: PropTypes.func,
  onGoBack: PropTypes.func,
};

export default FormTitleLayout;
