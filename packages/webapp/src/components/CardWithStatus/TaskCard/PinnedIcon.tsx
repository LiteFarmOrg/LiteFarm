import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsPinAngleFill } from 'react-icons/bs';
import { colors } from '../../../assets/theme';

export const PinnedIcon = () => {
  const { t } = useTranslation();

  return (
    <BsPinAngleFill
      aria-label={t(`TASK.PINNED`)}
      style={{ marginLeft: '0.5em' }}
      fill={colors.teal900}
    />
  );
};
