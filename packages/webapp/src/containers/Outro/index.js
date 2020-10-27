import OutroImg from '../../assets/images/outro/outro.svg';
import React, {Component} from "react";
import styles from "./styles.scss";
import Footer from '../../stories/Footer/index';
import Button from '../../stories/Button/index'
import {connect} from 'react-redux';
import {farmSelector} from '../selector';
import history from '../../history';
import {finishOnboarding} from './actions';

function Outro ({farm, dispatch}) {

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

const mapStateToProps = (state) => {
    return {
      farm: farmSelector(state),
    }
  };

const mapDispatchToProps = (dispatch) => {
    return {dispatch};
}
  
  export default connect(mapStateToProps, mapDispatchToProps)(Outro);