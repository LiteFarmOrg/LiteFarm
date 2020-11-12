import Floater from "react-floater";
import React from "react";
import PureProfileFloater from "../../components/ProfileFloater";

export default function ProfileFloater({auth, children}) {
  const helpClick = () => {
  }
  const switchFarmClick = () => {
  }
  const logOutClick = () => {
    auth.logout();
  }
  const myInfoClick = () => {
  }
  const Wrapper = (
    <PureProfileFloater onHelp={helpClick} onInfo={myInfoClick} onLogout={logOutClick} onSwitchFarm={switchFarmClick} />
  )
  return (
    <Floater component={Wrapper} placement={'bottom-end'}>
      {children}
    </Floater>
  )
}
