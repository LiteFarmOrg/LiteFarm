import styles from './styles.module.scss';
import React from 'react';
import ReactJoyride, { STATUS } from 'react-joyride';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PureProfileFloater from '../../ProfileFloater';
import MyFarmIcon from '../../../assets/images/my-farm.svg';
import NotifIcon from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import ProfilePicture from '../../../assets/images/navbar/defaultpfp.png';
import PureMyFarmFloater from '../../MyFarmFloater';
import PureNotificationFloater from '../../NotificationFloater';
import clsx from 'clsx';
import { logout } from '../../../util/jwt';
import { useTranslation } from 'react-i18next';
import SmallerLogo from '../../../assets/images/smaller_logo.svg';
import SmallLogo from '../../../assets/images/small_logo.svg';

export default function PureNavBar({
  children,
  showSpotLight,
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
  const { t } = useTranslation([
    'translation',
    'crop',
    'common',
    'disease',
    'task',
    'expense',
    'fertilizer',
    'message',
    'gender',
    'role',
    'harvest_uses',
    'soil',
  ]);
  const farmSpotlight = t('NAVIGATION.SPOTLIGHT.FARM');
  const notificationsSpotlight = t('NAVIGATION.SPOTLIGHT.NOTIFICATION');
  const myProfileSpotlight = t('NAVIGATION.SPOTLIGHT.PROFILE');
  const steps = [
    {
      target: '#firstStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.FARM_TITLE'), true),
      content: returnContent(farmSpotlight, false),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'right-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#secondStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.NOTIFICATION_TITLE'), true),
      content: returnContent(notificationsSpotlight, false),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      placement: 'right-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#thirdStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.PROFILE_TITLE'), true),
      content: returnContent(myProfileSpotlight, false),
      locale: {
        last: returnNextButton(t('common:GOT_IT')),
      },
      placement: 'right-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 210,
        },
      },
      floaterProps: {
        styles: {
          floater: {
            marginRight: '12px',
          },
        },
      },
    },
  ];
  return (
    <nav className={styles.navBar}>
      <div className={styles.actionItemContainer}>
        {showSpotLight && (
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
              tooltip: {
                padding: '20px',
              },
              tooltipContent: {
                padding: '4px 0 0 0',
                marginBottom: '20px',
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
              zIndex: 100000,
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
      <Logo history={history} />
      {children}
    </nav>
  );
}

const returnContent = (spotlightType, title) => {
  return spotlightType.split(',').map(function (item, key) {
    return title ? (
      <span key={key} className={styles.green}>
        <p align="left" className={styles.p}>
          {item}
        </p>
      </span>
    ) : (
      <span key={key}>
        <p align="left" className={styles.p}>
          {item}
        </p>
      </span>
    );
  });
};

const returnNextButton = (str) => {
  return <span className={styles.black}>{str}</span>;
};

const Logo = ({ history }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <img src={matches ? SmallLogo : SmallerLogo} alt="Logo" onClick={() => history.push('/')} />
  );
};
