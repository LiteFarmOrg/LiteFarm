import React from 'react';
import LogoutIcon from '../../assets/images/navbar/logout.svg';
import MyInfoIcon from '../../assets/images/navbar/my-info.svg';
import HelpIcon from '../../assets/images/navbar/help-profile.svg';
import SwitchFarmIcon from '../../assets/images/navbar/switch-farm.svg';
import ListOption from "../Navigation/NavBar/ListOption";
import { useTranslation } from "react-i18next";

export default function PureProfileFloater({onInfo, onSwitchFarm, onHelp, onLogout, showSwitchFarm}) {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '-4px'}}>
      <ListOption clickFn={onInfo} iconText={t('PROFILE_FLOATER.INFO')} iconSrc={MyInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      { showSwitchFarm && <ListOption clickFn={onSwitchFarm} iconText={t('PROFILE_FLOATER.SWITCH')} iconSrc={SwitchFarmIcon}/> }
      <ListOption clickFn={onHelp} iconText={t('PROFILE_FLOATER.HELP')} iconSrc={HelpIcon} />
      <ListOption clickFn={onLogout} iconText={t('PROFILE_FLOATER.LOG_OUT')} iconSrc={LogoutIcon} customParagraphStyle={{paddingBottom: '0.5rem'}}/>
    </div>
  )
}

