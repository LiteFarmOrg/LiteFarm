import Floater from 'react-floater';
import React from 'react';
import FarmSwitchOutro from '../../components/FarmSwitchOutro';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';

export default function FarmSwitchOutroFloater({ children, onFinish }) {
  const { farm_name } = useSelector(userFarmSelector);
  return (
    <Floater
      autoOpen
      hideArrow
      component={<FarmSwitchOutro onFinish={onFinish} farm_name={farm_name} />}
      placement={'center'}
      styles={{ floater: { zIndex: 1500 } }}
    >
      {children}
    </Floater>
  );
}
