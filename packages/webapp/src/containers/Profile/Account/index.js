import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../../saga';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import { actions, Control, Form } from 'react-redux-form';
import { Button } from 'react-bootstrap';
import { userFarmSelector } from '../../userFarmSlice';

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
      console.log(users, users.phone_number, users.phone_number.number);
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
    const {user_id, farm_id} = user;
    const newUser = {...updated_user, user_id, farm_id};
    newUser.address = newUser.address? newUser.address: '';
    delete newUser.profile_picture;
    this.props.dispatch(updateUser(newUser));
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
            <label>User<br/>Address</label>
            <Control.text model=".userInfo.address"/>
          </div>
          <div className={defaultStyles.bottomContainer}>
            <div className={defaultStyles.buttonContainer}>
              <Button type='submit' variant='primary'>Save</Button>
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
    users: userFarmSelector(state),
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(Account);
