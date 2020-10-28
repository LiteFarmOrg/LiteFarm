import React, {Component} from "react";
import styles from "./styles.scss";
import Footer from '../../stories/Footer/index';
import Radio from '../../stories/Form/radio/index';
import {connect} from 'react-redux';
import {farmSelector} from '../selector';
import history from '../../history';
import {finishOnboarding} from './actions';
import Button from '../../stories/Button/index'

function RoleSelection ({farm, dispatch}) {

    const redirectFinish = () => {
        if (farm) {
            // TODO replace with Brandon's Splotlight component
            dispatch(finishOnboarding())
            history.push('/home')
        }
        // TODO: add else case wih Jimmy's organic farm 
      }


    return (
        <div className={styles.home}> 
            <div className={styles.lander}>
                    <div className={styles.greetContainer}>
                        <div className={styles.description}> 
                            <h3>{`What is your role on the farm?`}</h3>
                            <div className={styles.radio}>
                                <li><Radio label="Farm owner" checked></Radio></li>
                            </div>
                            <div className={styles.radio}>
                                <li><Radio label="Farm manager"></Radio></li>
                            </div>
                            <div className={styles.radio}>
                                <li><Radio label="Extension officer"></Radio></li>
                            </div>
                        </div>
                        </div>
                    </div>
                    <Footer
                        children={<><Button fullLength color="secondary" children='Go back'/>
                        
                                    <Button fullLength children='Continue' onClick={redirectFinish}/>
                                    </>}
                    >
                    </Footer>
                </div>
    )
    
}

const mapStateToProps = (state) => {
    return {
      farm: farmSelector(state),
    }
  };

const mapDispatchToProps = (dispatch) => {
    return {dispatch};
}
  
  export default connect(mapStateToProps, mapDispatchToProps)(RoleSelection);