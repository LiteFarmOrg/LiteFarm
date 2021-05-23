import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapTutorialModal from '../../../Modals/MapTutorialModal';
import PropTypes from 'prop-types';

export default function DrawLineModal({ dismissModal }) {
  const { t } = useTranslation();

  const steps = [
    t('FARM_MAP.TUTORIAL.LINE.STEP_ONE'),
    t('FARM_MAP.TUTORIAL.LINE.STEP_TWO'),
    t('FARM_MAP.TUTORIAL.LINE.STEP_THREE'),
    t('FARM_MAP.TUTORIAL.LINE.STEP_FOUR'),
  ];

  return (
    <MapTutorialModal
      title={t('FARM_MAP.TUTORIAL.LINE.TITLE')}
      steps={steps}
      dismissModal={dismissModal}
    />
  );
}

DrawLineModal.prototype = {
  dismissModal: PropTypes.func,
};
