import React from 'react';
import styles from './typography.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Infoi from '../Tooltip/Infoi';
import { ReactComponent as Leaf } from '../../assets/images/farmMapFilter/Leaf.svg';

export const Underlined = ({ children = 'Link', className = '', style, ...props }) => {
  return (
    <p className={clsx(styles.underlined, className)} style={style} {...props}>
      {children}
    </p>
  );
};

Underlined.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const AddLink = ({ children = 'Link', className = '', style, onClick, ...props }) => {
  return (
    <p style={style} className={clsx(styles.addLinkContainer, className)} {...props}>
      +{' '}
      <span className={clsx(styles.underlined)} onClick={onClick}>
        {children}
      </span>
    </p>
  );
};

AddLink.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const Title = ({ children = 'Title', className = '', style, ...props }) => {
  return (
    <h3 className={clsx(styles.title, className)} style={style} {...props}>
      {children}
    </h3>
  );
};

Title.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const Semibold = ({ children = 'Semibold', className = '', style, sm, ...props }) => {
  return (
    <h4 className={clsx(styles.semibold, sm && styles.sm, className)} style={style} {...props}>
      {children}
    </h4>
  );
};

Semibold.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  sm: PropTypes.bool,
};

export const Label = ({ children = 'Label', className = '', sm = false, style, ...props }) => {
  return sm ? (
    <span className={clsx(styles.smLabel, className)} style={style} {...props}>
      {children}
    </span>
  ) : (
    <h5 className={clsx(styles.label, className)} style={style} {...props}>
      {children}
    </h5>
  );
};

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  sm: PropTypes.bool,
};

export const Error = ({ children = 'Error', className = '', style, ...props }) => {
  return (
    <p className={clsx(styles.error, className)} style={style} {...props}>
      {children}
    </p>
  );
};

Error.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const Info = ({ children = 'Info', className = '', style, ...props }) => {
  return (
    <p className={clsx(styles.info, className)} style={style} {...props}>
      {children}
    </p>
  );
};

Info.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export const Main = ({
  children = 'Main',
  tooltipContent,
  hasLeaf,
  className = '',
  style,
  ...props
}) => {
  return (
    <p className={clsx(styles.main, className)} style={style} {...props}>
      {children}
      {hasLeaf && <Leaf style={{ marginLeft: '8px', transform: 'translateY(3px)' }} />}
      {tooltipContent && (
        <>
          &nbsp;&nbsp;
          <Infoi
            style={{ fontSize: '18px', transform: 'translateY(3px)' }}
            content={tooltipContent}
          />
        </>
      )}
    </p>
  );
};

Main.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  tooltipContent: PropTypes.string,
  hasLeaf: PropTypes.bool,
};

export const Text = ({ children = 'Text', className = '', style, ...props }) => {
  return (
    <p className={clsx(styles.text, className)} style={style} {...props}>
      {children}
    </p>
  );
};

Text.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};
