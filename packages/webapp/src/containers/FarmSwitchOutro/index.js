import Floater from "react-floater";
import React from "react";
import FarmSwitchOutro from "../../components/FarmSwitchOutro";
import {switchFarmCloseSuccess} from "../switchFarmSlice"
import { useDispatch } from 'react-redux';

export default function FarmSwitchOutroFloater({children, onFinish}) {
  const dispatch = useDispatch();
  const onFinishClick = () => {
    dispatch(switchFarmCloseSuccess())
  }
  const Wrapper = (
    <FarmSwitchOutro onFinish={onFinishClick}/>
  )
  return (
    <Floater autoOpen hideArrow component={Wrapper} placement={'center'} onFinish={onFinish}>
      {children}
    </Floater>
  )
}