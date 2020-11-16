import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import ProfilePicture from "../../../assets/images/navbar/defaultpfp.png"; // TODO: use profile picture stored in db
import React, { useState } from "react";
import ReactJoyride, { STATUS } from 'react-joyride';
import ProfileFloater from "../../../containers/ProfileFloater";

export default function PureNavBar({ logo, children, steps, resetSpotlight, auth }) {
  const initialState = { profile: false };
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
          run={steps.run}
          continuous
          showSkipButton
          callback={resetSpotlightStatus}
          styles=
            {
              {
                options: {
                  // modal arrow and background color
                  arrowColor: "#eee",
                  backgroundColor: "#eee",
                  // page overlay color
                  overlayColor: "rgba(36, 39, 48, 0.5)",
                  //button color
                  // primaryColor: "#06AB16",
                  primaryColor: "#FED450",
                  //text color
                  // textColor: "##000000",
                  //width of modal
                  width: 270,
                  //zindex of modal
                  zIndex: 2000,
                  beaconSize: 36,
                },

              }

            }
        />

        }

        <input id="firstStep" type="image" src={MyFarmIcon} className={styles.actionItem}/>
        <input id="secondStep" type="image" src={NotifIcon} className={styles.actionItem}/>
        <ProfileFloater auth={auth}>
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
