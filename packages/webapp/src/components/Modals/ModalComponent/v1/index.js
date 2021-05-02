import styles from './styles.module.scss';
import Button from '../../../Form/Button';
import React from 'react';
import { Title } from '../../../Typography';
import PropTypes from 'prop-types';

export default function ModalComponent({
  title,
  onClick,
  disabled,
  icon,
  descriptions,
  buttonLabel,
  buttonColor,
}) {
  const buttonStyles = {
    letterSpacing: '0.4005px',
    width: '240px',
    marginTop: '30px',
  };

  return (
    <div className={styles.container}>
      {icon}
      <Title style={{ color: 'var(--teal700)', marginBottom: '20px', marginTop: '12px' }}>
        {title}
      </Title>
      {descriptions.map((description) => (
        <Title style={{ marginBottom: 0, textAlign: 'center' }}>{description}</Title>
      ))}
      <Button
        fullLength
        style={{ ...buttonStyles }}
        color={buttonColor}
        onClick={onClick}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

ModalComponent.prototype = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  descriptions: PropTypes.arrayOf(PropTypes.string),
  buttonLabel: PropTypes.string,
  buttonColor: PropTypes.oneOf(['primary', 'secondary']),
};
