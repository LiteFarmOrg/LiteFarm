import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import HelpIcon from "../../../assets/images/help.svg";
import React from "react";
import ReactJoyride from 'react-joyride';

export default function PureNavBar({logo, children, steps}) {
  console.log("we are in nav bar component...")
  console.log("steps is")
  console.log(steps)
  return (
    <div className={styles.navBar}>
      <div className={styles.actionItemContainer}>
      <ReactJoyride
          steps={steps}
        />
        <input type="image" src={MyFarmIcon} className={styles.actionItem}/>
        <input type="image" src={NotifIcon} className={styles.actionItem}/>
        <input type="image" src={HelpIcon} className={styles.actionItem}/>
      </div>
      <div className={styles.itemContainer}>
        {logo}
      </div>
      {children}
    </div>
  );
}
