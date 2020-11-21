import Floater from "react-floater";
import React from "react";
import PureProfileFloater from "../../components/ProfileFloater";
import history from '../../history';
export default function ProfileFloater({auth, children}) {
  const helpClick = () => {
  }
  const switchFarmClick = () => {
    history.push('/farm_selection');
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
