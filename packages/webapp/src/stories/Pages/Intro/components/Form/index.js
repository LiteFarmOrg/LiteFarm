import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';

const Form = ({
  classes = { container: '', navbar: '', footer: '' },
  children,
  buttonGroup,
  onSubmit
}) =>{
  return <form onSubmit={onSubmit}>
    <Layout buttonGroup={buttonGroup} children={children} classes={classes} isSVG={false}/>
  </form>
}

Form.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  buttonGroup: PropTypes.node,
  classes: PropTypes.exact({ container: PropTypes.string, navbar: PropTypes.string, footer: PropTypes.string }),
  onSubmit: PropTypes.func
}

export default Form;