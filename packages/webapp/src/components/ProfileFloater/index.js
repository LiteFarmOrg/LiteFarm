import React from 'react';
import LogoutIcon from '../../assets/images/navbar/logout.svg';
import MyInfoIcon from '../../assets/images/navbar/my-info.svg';
import HelpIcon from '../../assets/images/navbar/help-profile.svg';
import SwitchFarmIcon from '../../assets/images/navbar/switch-farm.svg';
import ListOption from '../Navigation/NavBar/ListOption';
import Floater from 'react-floater';

export function PureProfileFloaterComponent({ onInfo, onSwitchFarm, onHelp, onLogout, showSwitchFarm }) {
  return (
    <div style={{
      maxWidth: '148px',
      minWidth: '138px',
      backgroundColor: 'white',
      borderRadius: '4px',
      marginRight: '-4px',
    }}>
      <ListOption clickFn={onInfo} iconText={'My info'} iconSrc={MyInfoIcon}
                  customParagraphStyle={{ paddingTop: '0.5rem' }}/>
      {showSwitchFarm && <ListOption clickFn={onSwitchFarm} iconText={'Switch farm'} iconSrc={SwitchFarmIcon}/>}
      <ListOption clickFn={onHelp} iconText={'Help'} iconSrc={HelpIcon}/>
      <ListOption clickFn={onLogout} iconText={'Log out'} iconSrc={LogoutIcon}
                  customParagraphStyle={{ paddingBottom: '0.5rem' }}/>
    </div>
  )
}

export default function PureProfileFloater({ auth, children, openProfile, showSwitchFarm, closeInteraction, history }) {
  const helpClick = () => {
  }
  const switchFarmClick = () => {
    history.push('/farm_selection');
    closeInteraction('profile');
  }
  const logOutClick = () => {
    auth.logout();
  }
  const myInfoClick = () => {
    history.push('/Profile');
    closeInteraction('profile');
  }
  return (
    <Floater component={<PureProfileFloaterComponent onHelp={helpClick} onInfo={myInfoClick} onLogout={logOutClick}
                                                     onSwitchFarm={switchFarmClick} showSwitchFarm={showSwitchFarm}/>}
             placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  )
}

