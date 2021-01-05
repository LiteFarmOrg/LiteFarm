import styles from './styles.scss';
import React from 'react';
import ReactJoyride, { STATUS } from 'react-joyride';
import PureProfileFloater from '../../ProfileFloater';
import MyFarmIcon from '../../../assets/images/my-farm.svg';
import NotifIcon from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import ProfilePicture from '../../../assets/images/navbar/defaultpfp.png';
import PureMyFarmFloater from '../../MyFarmFloater';
import PureNotificationFloater from '../../NotificationFloater';
import clsx from 'clsx';
import { logout } from '../../../util/jwt';

export default function PureNavBar({
  logo,
  children,
  steps,
  resetSpotlight,
  changeInteraction,
  isOneTooltipOpen,
  showSwitchFarm,
  tooltipInteraction,
  history,
}) {
  const resetSpotlightStatus = (data) => {
    const { action, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      resetSpotlight();
    }
  };
  //PureMyFarmFloater
  const farmInfoClick = () => {
    history.push({
      pathname: '/Profile',
      state: 'farm',
    });
    changeInteraction('myFarm');
  };
  const farmMapClick = () => {
    history.push('/Field');
    changeInteraction('myFarm');
  };
  const peopleClick = () => {
    history.push({
      pathname: '/Profile',
      state: 'people',
    });
    changeInteraction('myFarm');
  };

  //PureProfileFloater
  const helpClick = () => {
    history.push('/help');
    changeInteraction('profile');
  };
  const switchFarmClick = () => {
    history.push('/farm_selection');
    changeInteraction('profile');
  };
  const logOutClick = () => {
    logout();
    changeInteraction('profile');
  };
  const myInfoClick = () => {
    history.push('/Profile');
    changeInteraction('profile');
  };

  // Pure Notification Floater
  const notificationTeaserClick = () => {
    changeInteraction('notification');
  };

  return (
    <nav className={styles.navBar}>
      <div className={styles.actionItemContainer}>
        {steps && (
          <ReactJoyride
            steps={steps}
            continuous
            callback={resetSpotlightStatus}
            floaterProps={{ disableAnimation: true }}
            styles={{
              options: {
                // modal arrow color
                arrowColor: '#fff',
                // modal background color
                backgroundColor: '#fff',
                // tooltip overlay color
                overlayColor: 'rgba(30, 30, 48, 1)',
                // next button color
                primaryColor: '#FCE38D',
                //width of modal
                width: 270,
                //zindex of modal
                zIndex: 100,
              },
              buttonClose: {
                display: 'none',
              },
              buttonBack: {
                display: 'none',
              },
            }}
          />
        )}
        <PureMyFarmFloater
          openProfile={tooltipInteraction['myFarm']}
          farmInfoClick={farmInfoClick}
          farmMapClick={farmMapClick}
          peopleClick={peopleClick}
        >
          <input
            id="firstStep"
            type="image"
            src={MyFarmIcon}
            className={clsx(styles.actionItem, styles.inFloater)}
            onClick={() => changeInteraction('myFarm')}
          />
        </PureMyFarmFloater>
        <PureNotificationFloater
          openProfile={tooltipInteraction['notification']}
          notificationTeaserClick={notificationTeaserClick}
        >
          <input
            id="secondStep"
            type="image"
            src={NotifIcon}
            className={clsx(styles.actionItem, styles.inFloater)}
            onClick={() => changeInteraction('notification')}
          />
        </PureNotificationFloater>
        <PureProfileFloater
          showSwitchFarm={showSwitchFarm}
          openProfile={tooltipInteraction['profile']}
          helpClick={helpClick}
          myInfoClick={myInfoClick}
          logOutClick={logOutClick}
          switchFarmClick={switchFarmClick}
        >
          <input
            data-testid="thirdStep"
            id="thirdStep"
            type="image"
            src={ProfilePicture}
            className={clsx(styles.profilePicture)}
            onClick={() => changeInteraction('profile')}
          />
        </PureProfileFloater>
        {isOneTooltipOpen && (
          <div
            style={{
              position: 'fixed',
              zIndex: 100,
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
            }}
            onClick={() => changeInteraction('', true)}
          />
        )}
      </div>
      <div className={styles.itemContainer}>{logo}</div>
      {children}
    </nav>
  );
}
