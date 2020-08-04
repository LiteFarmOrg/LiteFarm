import React, {Component} from "react";
import {userInfoSelector} from '../../selector';
import {connect} from 'react-redux';
import {updateUserInfo,} from '../../actions';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import {actions, Control, Form} from 'react-redux-form';
import {Button} from 'react-bootstrap';

class Account extends Component {
  componentDidMount() {
    const {dispatch, users} = this.props;
    if (users) {
      dispatch(actions.change('profileForms.userInfo.first_name', users.first_name));
      dispatch(actions.change('profileForms.userInfo.last_name', users.last_name));
      dispatch(actions.change('profileForms.userInfo.email', users.email));
      dispatch(actions.change('profileForms.userInfo.phone_number', users.phone_number));
      dispatch(actions.change('profileForms.userInfo.address', users.address));
    }
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.users !== prevProps.users) {
      const {dispatch, users} = this.props;
      if (users) {
        dispatch(actions.change('profileForms.userInfo.first_name', users.first_name));
        dispatch(actions.change('profileForms.userInfo.last_name', users.last_name));
        dispatch(actions.change('profileForms.userInfo.email', users.email));
        dispatch(actions.change('profileForms.userInfo.phone_number', users.phone_number));
        dispatch(actions.change('profileForms.userInfo.address', users.address));
      }
    }
  }

  handleSubmit(updated_user, user) {
    user.first_name = updated_user.first_name;
    user.last_name = updated_user.last_name;
    user.phone_number = updated_user.phone_number;
    user.address = updated_user.address === null || updated_user.address === undefined ? '' : updated_user.address;
    // TODO: remove hardcoded string for prof pic
    //user.profile_picture = '';
    this.props.dispatch(updateUserInfo(user));
  }

  render() {
    const {users} = this.props;
    return <div>
      <h3 className={styles.headerTitle}>Personal Information</h3>
      <div className={styles.formContainer}>
        <Form model="profileForms" onSubmit={(val) => this.handleSubmit(val.userInfo, users)}>
          <div className={styles.labelContainer}>
            <label>First<br/>Name</label>
            <Control.text model=".userInfo.first_name" validators={{required: (val) => val && val.length}}/>
          </div>
          <div className={styles.labelContainer}>
            <label>Last<br/>Name</label>
            <Control.text model=".userInfo.last_name" validators={{required: (val) => val && val.length}}/>
          </div>
          <div className={styles.labelContainer}>
            <label>Email</label>
            <Control.text model=".userInfo.email" validators={{required: (val) => val && val.length}} disabled={true}/>
          </div>
          <div className={styles.labelContainer}>
            <label>Phone<br/>Number</label>
            <Control.text model=".userInfo.phone_number"/>
          </div>
          <div className={styles.labelContainer}>
            <label>Address</label>
            <Control.text model=".userInfo.address"/>
          </div>
          <div className={defaultStyles.bottomContainer}>
            <div className={defaultStyles.buttonContainer}>
              <Button type='submit' bsStyle='primary'>Save</Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

const mapStateToProps = (state) => {
  return {
    users: userInfoSelector(state),
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(Account);
