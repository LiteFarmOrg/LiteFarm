import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapTutorialModal from '../../../Modals/MapTutorialModal';
import PropTypes from 'prop-types';

export default function DrawAreaModal({ dismissModal }) {
  const { t } = useTranslation();

  const steps = [
    t('FARM_MAP.TUTORIAL.AREA.STEP_ONE'),
    t('FARM_MAP.TUTORIAL.AREA.STEP_TWO'),
    t('FARM_MAP.TUTORIAL.AREA.STEP_THREE'),
  ]

  return (
    <MapTutorialModal
      title={t('FARM_MAP.TUTORIAL.AREA.TITLE')}
      steps={steps}
      dismissModal={dismissModal}
    />
  );
}

DrawAreaModal.prototype = {
  dismissModal: PropTypes.func,
};
