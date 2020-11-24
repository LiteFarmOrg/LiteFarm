import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import ProfilePicture from "../../../assets/images/navbar/defaultpfp.png"; // TODO: use profile picture stored in db
import React, { useState } from "react";
import ReactJoyride, { STATUS } from 'react-joyride';
import ProfileFloater from "../../../containers/ProfileFloater";
import MyFarmFloater from "../../../containers/MyFarmFloater"

export default function PureNavBar({ logo, children, steps, resetSpotlight, auth, showSwitchFarm }) {
  const initialState = { profile: false, myFarm: false };
  const [tooltipInteraction, setTooltipInteraction] = useState(initialState);
  const [isOneTooltipOpen, setOneTooltipOpen] = useState(false);

  const resetSpotlightStatus = (data) => {
    const { action, status } = data;


    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      resetSpotlight();
    }
  }

  const changeInteraction = (tooltipName, onOverlay=false) => {
    const newInteraction = onOverlay ? initialState : {...initialState, [tooltipName]: !tooltipInteraction[tooltipName]};
    setTooltipInteraction(newInteraction);
    setOneTooltipOpen(Object.keys(newInteraction).some((k) => newInteraction[k]));
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
        <MyFarmFloater openProfile={tooltipInteraction['myFarm']}>
        <input id="firstStep" type="image" src={MyFarmIcon} className={styles.actionItem} onClick={() =>changeInteraction('myFarm')} />
        </MyFarmFloater>
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
        <input id="secondStep" type="image" src={NotifIcon} className={styles.actionItem}/>
        <ProfileFloater showSwitchFarm={showSwitchFarm} auth={auth} openProfile={tooltipInteraction['profile']}>
          <input data-testid="thirdStep" id="thirdStep" type="image" src={ProfilePicture} className={styles.profilePicture} onClick={() =>changeInteraction('profile')} />
        </ProfileFloater>
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
