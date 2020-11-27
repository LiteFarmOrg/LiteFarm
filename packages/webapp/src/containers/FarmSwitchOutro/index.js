import Floater from "react-floater";
import React from "react";
import FarmSwitchOutro from "../../components/FarmSwitchOutro";

export default function FarmSwitchOutroFloater({children, onFinish}) {
  return (
    <Floater autoOpen hideArrow component={(<FarmSwitchOutro onFinish={onFinish} />)} placement={'center'}>
      {children}
    </Floater>
  )
}