import styles from "./styles.scss";
import OutroImg from "../../assets/images/outro/outro.svg";
import Footer from "../Footer";
import Button from "../Form/Button";
import React from "react";

export default function PureOutroSplash({redirectFinish}) {
  return (
    <div className={styles.home}>
      <div className={styles.lander}>
        <div className={styles.greetContainer}>
          <img src={OutroImg}/>
          <div className={styles.description}>
            <h3>{`And finally, let us show you a couple of important things!`}</h3>
          </div>
        </div>
        <Footer
          children={<><Button fullLength color="secondary" children='Go back'/>

            <Button fullLength children='Finish' onClick={redirectFinish}/>
          </>}
        >
        </Footer>
      </div>
    </div>
  )
}
