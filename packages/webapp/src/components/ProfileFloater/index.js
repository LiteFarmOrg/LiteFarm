import React from 'react';
import Floater from 'react-floater';
import LogoutIcon from '../../assets/images/navbar/logout.svg';
import MyInfoIcon from '../../assets/images/navbar/my-info.svg';
import HelpIcon from '../../assets/images/navbar/help-profile.svg';
import SwitchFarmIcon from '../../assets/images/navbar/switch-farm.svg';
import ListOption from "../Navigation/NavBar/ListOption";

export default function PureProfileFloater({onInfo, onSwitchFarm, onHelp, onLogout}) {
  return (
    <div style={{ maxWidth: '300px', minWidth:'138px',backgroundColor: 'white', padding: '0.8rem', marginRight:'1.22rem', borderRadius:'4px'}}>
      <ListOption clickFn={onInfo} iconText={'My info'} iconSrc={MyInfoIcon} />
      <ListOption clickFn={onSwitchFarm} iconText={'Switch farm'} iconSrc={SwitchFarmIcon} />
      <ListOption clickFn={onHelp} iconText={'Help'} iconSrc={HelpIcon} />
      <ListOption clickFn={onLogout} iconText={'Log out'} iconSrc={LogoutIcon} />
    </div>
  )
}

