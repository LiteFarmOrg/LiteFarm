import React from 'react';
import './styles.scss';
export default function ListOption({
  iconText,
  clickFn,
  icon,
  customParagraphStyle = {},
  customIconStyle = {},
}) {
  const paragraphStyle = Object.assign(
    {
      paddingLeft: '0.8rem',
      paddingRight: '0.8rem',
      paddingBottom: '0.4rem',
      paddingTop: '0.4rem',
      fontFamily: '"Open Sans"," SansSerif", serif',
      fontSize: '0.88rem',
      marginBottom: '0px',
      cursor: 'pointer',
    },
    customParagraphStyle,
  );
  const iconStyle = Object.assign({ paddingRight: '0.3rem' }, customIconStyle);
  return (
    <span className={'listOption'} onClick={clickFn}>
      <p style={paragraphStyle}>
        <span style={iconStyle}>{icon}</span>
        {iconText}
      </p>
    </span>
  );
}
