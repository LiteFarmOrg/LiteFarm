import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../../saga';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import { actions, Control, Form } from 'react-redux-form';
import { Button } from 'react-bootstrap';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';

class Account extends Component {
  componentDidMount() {
    const { dispatch, users } = this.props;
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
      const { dispatch, users } = this.props;
      if (users) {
        dispatch(actions.change('profileForms.userInfo.first_name', users.first_name));
        dispatch(actions.change('profileForms.userInfo.last_name', users.last_name));
        dispatch(actions.change('profileForms.userInfo.email', users.email));
        dispatch(actions.change('profileForms.userInfo.phone_number', users.phone_number));
        dispatch(actions.change('profileForms.userInfo.address', users.address));
      }
    }
  }

  changeLanguage = (event) => {
    this.props.i18n.changeLanguage(event.target.value);
    localStorage.setItem('litefarm_lang', event.target.value);
  };

  handleSubmit(updated_user, user) {
    console.log('submitting');
    const { user_id, farm_id } = user;
    const newUser = {
      ...updated_user,
      user_id,
      farm_id,
      language_preference: localStorage.getItem('litefarm_lang'),
    };
    newUser.address = newUser.address ? newUser.address : '';
    delete newUser.profile_picture;
    this.props.dispatch(updateUser(newUser));
  }

  render() {
    const { users } = this.props;
    const currentLanguage = localStorage.getItem('litefarm_lang');
    return (
      <div>
        <h3 className={styles.headerTitle}>
          {this.props.t('PROFILE.ACCOUNT.PERSONAL_INFORMATION')}
        </h3>
        <div className={styles.formContainer}>
          <Form model="profileForms" onSubmit={(val) => this.handleSubmit(val.userInfo, users)}>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.FIRST_NAME')}</label>
              <Control.text
                model=".userInfo.first_name"
                validators={{ required: (val) => val && val.length }}
              />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.LAST_NAME')}</label>
              <Control.text
                model=".userInfo.last_name"
                validators={{ required: (val) => val && val.length }}
              />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.EMAIL')}</label>
              <Control.text
                model=".userInfo.email"
                validators={{ required: (val) => val && val.length }}
                disabled={true}
              />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.PHONE_NUMBER')}</label>
              <Control.text model=".userInfo.phone_number" />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.USER_ADDRESS')}</label>
              <Control.text model=".userInfo.address" />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.LANGUAGE')}</label>
              <select
                style={{ marginLeft: '8px' }}
                onChange={this.changeLanguage}
              >
                <option value="en" selected={currentLanguage === "en"}>{this.props.t('PROFILE.ACCOUNT.ENGLISH')}</option>
                <option value="es" selected={currentLanguage === "es"}>{this.props.t('PROFILE.ACCOUNT.SPANISH')}</option>
                <option value="pt" selected={currentLanguage === "pt"}>{this.props.t('PROFILE.ACCOUNT.PORTUGUESE')}</option>
                <option value="fr" selected={currentLanguage === "fr"}>{this.props.t('PROFILE.ACCOUNT.FRENCH')}</option>
              </select>
            </div>
            <div className={defaultStyles.bottomContainer}>
              <div className={defaultStyles.buttonContainer}>
                <Button type="submit" variant="primary">
                  {this.props.t('common:SAVE')}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state) => {
  return {
    users: userFarmSelector(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Account));
