import React from 'react';
import LogoutIcon from '../../assets/images/navbar/logout.svg';
import MyInfoIcon from '../../assets/images/navbar/my-info.svg';
import HelpIcon from '../../assets/images/navbar/help-profile.svg';
import SwitchFarmIcon from '../../assets/images/navbar/switch-farm.svg';
import ListOption from "../Navigation/NavBar/ListOption";

export default function PureProfileFloater({onInfo, onSwitchFarm, onHelp, onLogout}) {
  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '11px'}}>
      <ListOption clickFn={onInfo} iconText={'My info'} iconSrc={MyInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}  />
      <ListOption clickFn={onSwitchFarm} iconText={'Switch farm'} iconSrc={SwitchFarmIcon} />
      <ListOption clickFn={onHelp} iconText={'Help'} iconSrc={HelpIcon} />
      <ListOption clickFn={onLogout} iconText={'Log out'} iconSrc={LogoutIcon} customParagraphStyle={{paddingBottom: '0.5rem'}} o />
    </div>
  )
}

