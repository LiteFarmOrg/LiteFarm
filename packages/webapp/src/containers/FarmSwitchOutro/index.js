import Floater from "react-floater";
import React from "react";
import FarmSwitchOutro from "../../components/FarmSwitchOutro";

export default function FarmSwitchOutroFloater({children, onFinish}) {
  const onFinishClick = () => {
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