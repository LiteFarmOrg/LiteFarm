import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import HelpIcon from "../../../assets/images/help.svg";
import React from "react";
import ReactJoyride, {ACTIONS, EVENTS, STATUS} from 'react-joyride';

export default function PureNavBar({logo, children, steps, resetSpotlight}) {

  const resetSpotlightStatus = (data) => {
    const { action, index, status, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      resetSpotlight();
    }
  }


  return (
      <div className={styles.navBar}>
      <div className={styles.actionItemContainer}>

      {steps &&
      <ReactJoyride
      steps={steps}
      run={steps.run}
      continuous
      showProgress
      showSkipButton
      locale="Back"
      callback={resetSpotlightStatus}
      styles=
      {
        {
          arrow: {
            color: '#fff',
            display: 'inline-flex',
            length: 160000000,
            margin: 8,
            position: 'absolute',
            spread: 32,
          },
       options: {
          // modal arrow and background color
          arrowColor: "#eee",
          backgroundColor: "#eee",
          // page overlay color
          overlayColor: "rgba(191, 191, 191, 1)",
          //button color  
          primaryColor: "#06AB16",
          //text color
          textColor: "##000000",
          //width of modal
          width: 300,
          //zindex of modal
          zIndex: 2000,
          beaconSize: 36,
          locale: { back: 'cack', close: 'close', last: 'last', next: 'next', skip: 'skip' }
      },
      placement: "top-end"

    }
  }
    /> 
   
    }
       
            <input id="firstStep" type="image" src={MyFarmIcon} className={styles.actionItem}/>
            <input id="secondStep" type="image" src={NotifIcon} className={styles.actionItem}/>
            <input id="thirdStep" type="image" src={HelpIcon} className={styles.actionItem}/>
          
      </div>
      <div className={styles.itemContainer}>
        {logo}
      </div>
      {children}
    </div>
  );
}
