import Floater from "react-floater";
import React, { useState } from "react";
import PureResetPassword from "../../components/ResetPassword";

export default function ResetPassword({children}) {
  const [changeText, setChangeText] = useState(false);

  const resendLink = () => {
    setChangeText(true);
    setTimeout(() => {
      setChangeText(false);
    }, 3000);
  }

  const Wrapper = (
    <PureResetPassword resendLink={resendLink} changeText={changeText} />
  )
  return (
    <Floater autoOpen component={Wrapper} placement={'center'} >
      {children}
    </Floater>
  )
}