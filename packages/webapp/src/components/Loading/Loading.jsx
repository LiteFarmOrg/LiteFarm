import LoadingAnimation from '../../assets/images/signUp/animated_loading_farm.svg?react';
import React from 'react';
import { colors } from '../../assets/theme';

export function Loading({ children, style, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        backgroundColor: colors.grey400,
        ...style,
      }}
      {...props}
    >
      {children || <LoadingAnimation />}
    </div>
  );
}
