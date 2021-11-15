import Floater from 'react-floater';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FarmSwitchOutro from '../../../../components/FarmSwitchOutro';
import { endSwitchFarmModal } from '../../../ChooseFarm/chooseFarmFlowSlice';
import { userFarmSelector } from '../../../userFarmSlice';

export default function FarmSwitchOutroFloater({ children }) {
  const dispatch = useDispatch();
  const { farm_name, farm_id } = useSelector(userFarmSelector);
  const dismissPopup = () => dispatch(endSwitchFarmModal(farm_id));

  return (
    <>
      <Floater
        autoOpen
        hideArrow
        component={<FarmSwitchOutro onFinish={dismissPopup} farm_name={farm_name} />}
        placement={'center'}
        styles={{ floater: { zIndex: 1500 } }}
      >
        {children}
      </Floater>
      <div
        onClick={dismissPopup}
        style={{
          position: 'fixed',
          zIndex: 1500,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 25, 40, 0.8)',
        }}
      />
    </>
  );
}
