import React from 'react';
import Input from '../../../Form/Input';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import clsx from 'clsx';

const TwoInputWithTitle = ({title, label0, label1, info0, info1, icon0, icon1, classes={}}) => {
  const { title: titleClass, ...inputClasses } = styles;
  return (
    <>
      <h4 className={clsx(styles.title, classes.title)}>{title}</h4>
      <Input label={label0} info={info0} icon={icon0} classes={inputClasses}/>
      <Input label={label1}
             info={info1}
             icon={icon1}
             classes={inputClasses}
      />
    </>
  );
};

TwoInputWithTitle.propTypes = {
  title: PropTypes.string,
  label0: PropTypes.string,
  label1: PropTypes.string,
  info0: PropTypes.string,
  info1: PropTypes.string,
  icon0: PropTypes.node,
  icon1: PropTypes.node,
  classes: PropTypes.exact({ input: PropTypes.string, label: PropTypes.string, container: PropTypes.string, info: PropTypes.string, title: PropTypes.string }),
}
export default TwoInputWithTitle;