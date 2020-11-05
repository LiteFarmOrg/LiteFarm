import styles from "./styles.scss";
import MyFarmIcon from "../../../assets/images/my-farm.svg";
import NotifIcon from "../../../assets/images/notif.svg";
import HelpIcon from "../../../assets/images/help.svg";
import React from "react";
import ReactJoyride from 'react-joyride';

export default function PureNavBar({logo, children, steps}) {
  return (
      <div className={styles.navBar}>
      <div className={styles.actionItemContainer}>
      <ReactJoyride
                steps={steps}
                // run={this.state.run}
                continuous
                showProgress
                showSkipButton
                styles={{
                 options: {
                    // modal arrow and background color
                    // arrowColor: "#eee",
                    backgroundColor: "#eee",
                    // page overlay color
                    overlayColor: "rgba(191, 191, 191, 1)",
                    //button color  
                    primaryColor: "#FED450",
                    //text color
                    textColor: "##000000",
         
                    //width of modal
                    width: 300,
                    //zindex of modal
                    zIndex: 2000
                }
             }}
        />
          
            
            <input ng-repeat id="firstStep" type="image" src={MyFarmIcon} className={styles.actionItem}/>
            
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
