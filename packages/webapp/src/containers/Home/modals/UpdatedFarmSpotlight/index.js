import React from 'react';
import { useDispatch } from 'react-redux';
import NotifyUpdatedFarmModal from '../../../../components/Modals/NotifyUpdatedFarmModal';
import { setSpotlightToShown } from '../../../Map/saga';

export default function IntroduceMapSpotlight() {
  const dispatch = useDispatch();

  return (
    <NotifyUpdatedFarmModal dismissModal={() => dispatch(setSpotlightToShown('introduce_map'))} />
  );
}
