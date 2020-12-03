import styles from "./styles.scss";
import React from "react";
import ReactJoyride, { STATUS } from 'react-joyride';
import PureProfileFloater from '../../ProfileFloater';
import MyFarmIcon from '../../../assets/images/my-farm.svg';
import NotifIcon from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import ProfilePicture from '../../../assets/images/navbar/defaultpfp.png';
import PureMyFarmFloater from '../../MyFarmFloater';
import clsx from 'clsx';

export default function PureNavBar({ logo, children, steps, resetSpotlight, changeInteraction, isOneTooltipOpen, showSwitchFarm, auth, tooltipInteraction, history}) {
  const resetSpotlightStatus = (data) => {
    const { action, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      resetSpotlight();
    }
  }

  return (
    <div className={styles.navBar}>
      <div className={styles.actionItemContainer}>
        {steps &&
        <ReactJoyride
          steps={steps}
          continuous
          callback={resetSpotlightStatus}
          floaterProps={{ disableAnimation: true}}
          styles=
            {
              {
                options: {
                  // modal arrow color
                  arrowColor: "#fff",
                  // modal background color
                  backgroundColor: "#fff",
                  // tooltip overlay color
                  overlayColor: "rgba(30, 30, 48, 1)",
                  // next button color
                  primaryColor: "#FCE38D",
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
                }

              }

            }
        />

        }
        <PureMyFarmFloater closeInteraction={() => changeInteraction('myFarm')} openProfile={tooltipInteraction['myFarm']} history={history}>
          <input id="firstStep" type="image" src={MyFarmIcon} className={clsx(styles.actionItem, styles.inFloater)} onClick={() =>changeInteraction('myFarm')} />
        </PureMyFarmFloater>
        <input id="secondStep" type="image" src={NotifIcon} className={styles.actionItem}/>
        <PureProfileFloater showSwitchFarm={showSwitchFarm} auth={auth} closeInteraction={() => changeInteraction('profile')}
                        openProfile={tooltipInteraction['profile']} history={history}>
          <input data-testid="thirdStep" id="thirdStep" type="image" src={ProfilePicture} className={clsx(styles.profilePicture)}
                 onClick={() => changeInteraction('profile')}/>
        </PureProfileFloater>
        {
          isOneTooltipOpen && <div style={{
            position: "fixed",
            zIndex: 100,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.01)"}} onClick={() => changeInteraction('', true)} />
        }
      </div>
      <div className={styles.itemContainer}>
        {logo}
      </div>
      {children}
    </div>
  );
}
