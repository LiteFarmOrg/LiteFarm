import Floater from "react-floater";
import React from "react";
import PureResetPassword from "../../components/ResetPassword";

export default function ResetPassword({children}) {
  const Wrapper = (
    <PureResetPassword />
  )
  return (
    <Floater autoOpen component={Wrapper} placement={'center'} >
      {children}
    </Floater>
  )
}