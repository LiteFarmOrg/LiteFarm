import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';

const Form = ({
  classes = {},
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
  classes: PropTypes.exact({ container: PropTypes.object, footer: PropTypes.object }),
  onSubmit: PropTypes.func
}

export default Form;