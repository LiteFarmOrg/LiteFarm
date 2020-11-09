import React from 'react';
import styles from './typography.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


export const Underlined = ({
  children = 'Link',
  className = '',
  style,
  ...props
}) => {
  return (
    <p
      className={clsx(styles.underlined, className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
};

Underlined.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Title = ({
  children = 'Title',
  className = '',
  style,
  ...props
}) => {
  return (
    <h3
      className={clsx(styles.title, className)}
      style={style}
      {...props}
    >
      {children}
    </h3>
  );
};

Title.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Semibold = ({
  children = 'Semibold',
  className = '',
  style,
  ...props
}) => {
  return (
    <h4
      className={clsx(styles.semibold, className)}
      style={style}
      {...props}
    >
      {children}
    </h4>
  );
};

Semibold.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Label = ({
  children = 'Label',
  className = '',
  sm = false,
  style,
  ...props
}) => {
  return sm?(
    <span
      className={clsx(styles.smLabel, className)}
      style={style}
      {...props}
    >
      {children}
    </span>
  ):(
    <h5
      className={clsx(styles.label, className)}
      style={style}
      {...props}
    >
      {children}
    </h5>
  );
};

Label.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  sm: PropTypes.bool,
}

export const Error = ({
  children = 'Error',
  className = '',
  style,
  ...props
}) => {
  return (
    <p
      className={clsx(styles.error, className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
};

Error.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Info = ({
  children = 'Info',
  className = '',
  style,
  ...props
}) => {
  return (
    <p
      className={clsx(styles.info, className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
};

Info.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Main = ({
  children = 'Main',
  className = '',
  style,
  ...props
}) => {
  return (
    <p
      className={clsx(styles.main, className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
};

Main.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}

export const Text = ({
  children = 'Text',
  className = '',
  style,
  ...props
}) => {
  return (
    <p
      className={clsx(styles.text, className)}
      style={style}
      {...props}
    >
      {children}
    </p>
  );
};

Text.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
}