import React from 'react';
import { ReactComponent as LogoutIcon } from '../../assets/images/navbar/logout.svg';
import { ReactComponent as MyInfoIcon } from '../../assets/images/navbar/my-info.svg';
import { ReactComponent as HelpIcon } from '../../assets/images/navbar/help-profile.svg';
import { ReactComponent as SwitchFarmIcon } from '../../assets/images/navbar/switch-farm.svg';
import ListOption from '../Navigation/NavBar/ListOption';
import { useTranslation } from 'react-i18next';
import Floater from 'react-floater';
import PropTypes from 'prop-types';

export function PureProfileFloaterComponent({
  onInfo,
  onSwitchFarm,
  onHelp,
  onLogout,
  showSwitchFarm,
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        maxWidth: '148px',
        minWidth: '138px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginRight: '12px',
      }}
    >
      <ListOption
        clickFn={onInfo}
        iconText={t('PROFILE_FLOATER.INFO')}
        icon={<MyInfoIcon />}
        customParagraphStyle={{ paddingTop: '0.5rem' }}
      />
      {showSwitchFarm && (
        <ListOption
          clickFn={onSwitchFarm}
          iconText={t('PROFILE_FLOATER.SWITCH')}
          icon={<SwitchFarmIcon style={{ transform: 'translateX(1px)' }} />}
        />
      )}
      <ListOption clickFn={onHelp} iconText={t('PROFILE_FLOATER.HELP')} icon={<HelpIcon />} />
      <ListOption
        clickFn={onLogout}
        iconText={t('PROFILE_FLOATER.LOG_OUT')}
        icon={<LogoutIcon style={{ transform: 'translateX(2px)' }} />}
        customParagraphStyle={{ paddingBottom: '0.5rem' }}
      />
    </div>
  );
}

export default function PureProfileFloater({
  children,
  openProfile,
  showSwitchFarm,
  helpClick,
  myInfoClick,
  logOutClick,
  switchFarmClick,
}) {
  return (
    <Floater
      component={
        <PureProfileFloaterComponent
          onHelp={helpClick}
          onInfo={myInfoClick}
          onLogout={logOutClick}
          onSwitchFarm={switchFarmClick}
          showSwitchFarm={showSwitchFarm}
        />
      }
      placement={'bottom-end'}
      open={openProfile}
      styles={{
        floater: { zIndex: 1500 },
      }}
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
  showSwitchFarm: PropTypes.bool,
};

PureProfileFloater.prototype = {
  myInfoClick: PropTypes.func,
  switchFarmClick: PropTypes.func,
  helpClick: PropTypes.func,
  logOutClick: PropTypes.func,
  showSwitchFarm: PropTypes.bool,
  children: PropTypes.node,
  openProfile: PropTypes.bool,
};
