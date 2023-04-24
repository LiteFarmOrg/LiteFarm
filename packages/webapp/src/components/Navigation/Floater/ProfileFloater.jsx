import React from 'react';
import { ReactComponent as LogoutIcon } from '../../../assets/images/navbar/logout.svg';
import { ReactComponent as MyInfoIcon } from '../../../assets/images/navbar/my-info.svg';
import { ReactComponent as HelpIcon } from '../../../assets/images/navbar/help-profile.svg';
import { ReactComponent as VideoIcon } from '../../../assets/images/video_icon.svg';
import { ReactComponent as SwitchFarmIcon } from '../../../assets/images/navbar/switch-farm.svg';
import ListOption from '../NavBar/ListOption';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Floater } from './Floater';

export function PureProfileFloaterComponent({
  onInfo,
  onSwitchFarm,
  onHelp,
  onTutorials,
  onLogout,
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        maxWidth: '163px',
        minWidth: '138px',
        backgroundColor: 'white',
        borderRadius: '4px',
      }}
    >
      <ListOption clickFn={onInfo} iconText={t('PROFILE_FLOATER.INFO')} icon={<MyInfoIcon />} />

      <ListOption
        clickFn={onSwitchFarm}
        iconText={t('PROFILE_FLOATER.SWITCH')}
        icon={<SwitchFarmIcon style={{ transform: 'translateX(1px)' }} />}
      />

      <ListOption clickFn={onHelp} iconText={t('PROFILE_FLOATER.HELP')} icon={<HelpIcon />} />

      <ListOption
        clickFn={onTutorials}
        iconText={t('PROFILE_FLOATER.TUTORIALS')}
        icon={<VideoIcon />}
        isExternalLink
      />

      <ListOption
        clickFn={onLogout}
        iconText={t('PROFILE_FLOATER.LOG_OUT')}
        icon={<LogoutIcon style={{ transform: 'translateX(2px)' }} />}
        customParagraphStyle={{ paddingBottom: '0.5rem', paddingTop: '0.4rem' }}
      />
    </div>
  );
}

export default function PureProfileFloater({
  children,
  openProfile,
  helpClick,
  myInfoClick,
  logOutClick,
  switchFarmClick,
  tutorialsClick,
}) {
  return (
    <Floater
      body={
        <PureProfileFloaterComponent
          onHelp={helpClick}
          onInfo={myInfoClick}
          onLogout={logOutClick}
          onTutorials={tutorialsClick}
          onSwitchFarm={switchFarmClick}
        />
      }
      placement={'bottom-end'}
      open={openProfile}
    >
      {children}
    </Floater>
  );
}

PureProfileFloaterComponent.prototype = {
  onInfo: PropTypes.func,
  onSwitchFarm: PropTypes.func,
  onHelp: PropTypes.func,
  onLogout: PropTypes.func,
};

PureProfileFloater.prototype = {
  myInfoClick: PropTypes.func,
  switchFarmClick: PropTypes.func,
  helpClick: PropTypes.func,
  logOutClick: PropTypes.func,
  children: PropTypes.node,
  openProfile: PropTypes.bool,
};
