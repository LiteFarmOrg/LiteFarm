import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import HelpIcon from "../../../assets/images/help.svg";
import React from "react";

export default function PureNavBar({logo, children}) {
  return (
    <div className={styles.navBar}>
      <div className={styles.actionItemContainer}>
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
