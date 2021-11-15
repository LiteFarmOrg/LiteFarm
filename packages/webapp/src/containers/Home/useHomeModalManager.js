import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../userFarmSlice';
import {
  chooseFarmFlowSelector,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { doesCertifierSurveyExistSelector } from '../OrganicCertifierSurvey/slice';
import { showHelpRequestModalSelector } from './homeSlice';

export default function useHomeModalManager(history) {
  const showSwitchFarmModal = useSelector(switchFarmSelector);
  const doesCertifierSurveyExist = useSelector(doesCertifierSurveyExistSelector);
  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const isAdmin = useSelector(isAdminSelector);
  const { introduce_map, navigation } = useSelector(showedSpotlightSelector);
  const showCertificationsModal = !doesCertifierSurveyExist && isAdmin;
  const showNotifyUpdatedFarmModal = !introduce_map && navigation;

  console.log('useHomeModalManager');
  console.log({
    showSwitchFarmModal,
    showHelpRequestModal,
    showCertificationsModal,
    showNotifyUpdatedFarmModal,
  });

  if (showSwitchFarmModal) return { activeModal: 'switchFarm' };
  if (showHelpRequestModal) return { activeModal: 'helpRequest' };
  if (showCertificationsModal) return { activeModal: 'certifications' };
  if (showNotifyUpdatedFarmModal) return { activeModal: 'notifyUpdatedFarm' };

  return { activeModal: null };
}
