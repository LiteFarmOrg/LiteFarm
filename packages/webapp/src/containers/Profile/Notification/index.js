import React, { Component } from "react";
import { connect } from 'react-redux';
import { getUserInfo, setNotification } from './actions';
import { userInfoSelector } from './selector';
import { Control, Form } from 'react-redux-form';
import { Alert, Button } from 'react-bootstrap';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import { getUser } from '../../ChooseFarm/saga';

class Notification extends Component{
  constructor(props){
    super(props);
    this.state = {
      show: false
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleDismiss(){
    setTimeout(() => {
      this.setState({show: false});
    }, 3000)
  }

  handleSubmit(notification, user) {
    user.notification_setting = notification;
    this.props.dispatch(setNotification(user));
    this.handleShow();
    this.handleDismiss();
  }


  componentWillMount(){
    this.props.dispatch(getUserInfo());
    this.props.dispatch(getUser());


  }

  render(){
    const {user} =this.props;

    return (
      <div>
        {this.state.show && (
          <Alert variant="success">
            <strong>Saved!</strong>
          </Alert>
        )}
      <h4>Notification Settings</h4>
      <div className={styles.formContainer}>
        {user.user && (
          <Form model="profileForms" onSubmit={(val) => this.handleSubmit(val.notification, user.user)}>
            <div className={styles.labelContainer}>
              <label>Notify me about the weather</label>
              <Control.checkbox model=".notification.alert_weather" defaultValue={user.user.notification_setting.alert_weather}/>
            </div>
            <div className={styles.labelContainer}>
              <label>When workers finish an item on the to do list</label>
              <Control.checkbox model=".notification.alert_worker_finish" defaultValue={user.user.notification_setting.alert_worker_finish}/>
            </div>
            <div className={styles.labelContainer}>
            <label>When scouting indicates action is needed</label>
            <Control.checkbox model=".notification.alert_action_after_scouting" defaultValue={user.user.notification_setting.alert_action_after_scouting}/>
            </div>
            <div className={styles.labelContainer}>
            <label>Before my planned planting dates</label>
            <Control.checkbox model=".notification.alert_before_planned_date" defaultValue={user.user.notification_setting.alert_before_planned_date}/>
            </div>
            <div className={styles.labelContainer}>
            <label>When there is a pest alert in the LiteFarm network</label>
            <Control.checkbox model=".notification.alert_pest" defaultValue={user.user.notification_setting.alert_pest}/>
            </div>
            <div className={defaultStyles.bottomContainer}>
              <Button type='submit' variant='primary'>Save</Button>
            </div>          </Form>
        )}
      </div>
    </div>
    )
  }

}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

const mapStateToProps = (state) => {
  return {
    user: userInfoSelector(state),
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(Notification);
