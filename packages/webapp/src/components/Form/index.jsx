import PropTypes from 'prop-types';
import Layout from '../Layout';
import styles from './form.module.scss';

const Form = ({
  classes = { footer: { padding: '24px 16px 24px 16px', position: 'relative' } },
  children,
  buttonGroup,
  onSubmit,
  fullWidthContent = false,
  classNames = {},
  hasWhiteBackground = false,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate={true}>
      <Layout
        buttonGroup={buttonGroup}
        classes={classes}
        isSVG={false}
        fullWidthContent={fullWidthContent}
        className={classNames?.layout}
        hasWhiteBackground={hasWhiteBackground}
      >
        {children}
      </Layout>
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
  classNames: PropTypes.exact({
    layout: PropTypes.string,
  }),
};

export default Form;
