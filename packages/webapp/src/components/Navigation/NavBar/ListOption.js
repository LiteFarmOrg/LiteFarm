import React from "react";

export default function ListOption({ iconText, clickFn,iconSrc, customParagraphStyle = {}, customIconStyle={} }) {
  const paragraphStyle= Object.assign({
    marginRight:'0.8rem',
    fontFamily:'"Open Sans"," SansSerif", serif',
    cursor:'pointer'}, customParagraphStyle);
  const iconStyle = Object.assign({ marginRight: '0.7rem' }, customIconStyle);
  return (
    <span onClick={clickFn}>
        <p style={paragraphStyle}> <img src={iconSrc} style={iconStyle} alt={iconText}/>{iconText}</p>
    </span>
  )
}
