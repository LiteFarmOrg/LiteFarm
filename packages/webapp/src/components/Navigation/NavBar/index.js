import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import HelpIcon from "../../../assets/images/help.svg";
import React from "react";
import ReactJoyride, { STATUS } from 'react-joyride';
import ProfileFloater from "../../../containers/ProfileFloater";

export default function PureNavBar({ logo, children, steps, resetSpotlight, auth }) {

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
          // run={resizeDebounce}
          continuous
          callback={resetSpotlightStatus}
          floaterProps={{ disableAnimation: true }}
          styles=
            {
              {
                options: {
                  // modal arrow color
                  arrowColor: "#fff",
                  // modal background color
                  backgroundColor: "#fff",
                  // tooltip overlay color
                  overlayColor: "rgba(36, 39, 48, 0.5)",
                  // next button color
                  primaryColor: "#FCE38D",
                  //width of modal
                  width: 270,
                  //zindex of modal
                  zIndex: 2000,
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

        <input id="firstStep" type="image" src={MyFarmIcon} className={styles.actionItem}/>
        <input id="secondStep" type="image" src={NotifIcon} className={styles.actionItem}/>
        <ProfileFloater auth={auth}>
          <input id="thirdStep" type="image" src={HelpIcon} className={styles.actionItem}/>
        </ProfileFloater>

      </div>
      <div className={styles.itemContainer}>
        {logo}
      </div>
      {children}
    </div>
  );
}
