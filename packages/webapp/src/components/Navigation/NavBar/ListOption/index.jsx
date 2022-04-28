import React from 'react';
import styles from './listOption.module.scss';

export default function ListOption({
  iconText,
  clickFn,
  icon,
  customParagraphStyle = {},
  customIconStyle = {},
  isBeingIntroduced = false,
  isIntroductionActive = false,
}) {
  if (isIntroductionActive) {
    let alterStyles;
    if (isBeingIntroduced) {
      alterStyles = {
        background: '#c7efd3',
      };
    } else {
      alterStyles = {
        background: 'white',
      };
    }
    customParagraphStyle = {
      ...customParagraphStyle,
      ...alterStyles,
    };
    customIconStyle = {
      ...customIconStyle,
      ...alterStyles,
    };
  }

  const paragraphStyle = Object.assign(
    {
      paddingBottom: '0.4rem',
      paddingTop: '0.5rem',
      fontFamily: '"Open Sans"," SansSerif", serif',
      fontSize: '0.88rem',
      marginBottom: '0px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    customParagraphStyle,
  );
  const iconStyle = Object.assign(
    {
      width: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    customIconStyle,
  );
  return (
    <span className={styles.listOption} onClick={clickFn}>
      <div data-cy='navbar-option' style={paragraphStyle}>
        <div style={iconStyle} >{icon}</div>
        {iconText}
      </div>
    </span>
  );
}
