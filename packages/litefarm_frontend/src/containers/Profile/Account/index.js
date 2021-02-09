import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateUser } from '../../saga';
import styles from './styles.module.scss';
import defaultStyles from '../styles.module.scss';
import { actions, Control, Form } from 'react-redux-form';
import { Button } from 'react-bootstrap';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { integerOnKeyDown } from '../../../components/Form/Input';

class Account extends Component {
  constructor() {
    super();
    this.state = { selectedLanguage: localStorage.getItem('litefarm_lang') };
  }

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
        dispatch(actions.change('profileForms.userInfo.user_address', users.user_address));
      }
    }
  }

  changeLanguage = (event) => {
    this.setState({ selectedLanguage: event.target.value });
  };

  handleSubmit(updated_user, user) {
    const { user_id, farm_id } = user;
    const { selectedLanguage } = this.state;
    const language_preference = selectedLanguage.includes('-')
      ? selectedLanguage.split('-')[0]
      : selectedLanguage;

    const newUser = {
      ...updated_user,
      user_id,
      farm_id,
      language_preference,
    };
    newUser.user_address = newUser.user_address ? newUser.user_address : '';
    delete newUser.profile_picture;
    this.props.dispatch(updateUser(newUser));
  }

  render() {
    const { users } = this.props;
    const { selectedLanguage } = this.state;
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
              <Control.text
                type={'number'}
                onKeyDown={integerOnKeyDown}
                model=".userInfo.phone_number"
              />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.USER_ADDRESS')}</label>
              <Control.text model=".userInfo.user_address" />
            </div>
            <div className={styles.labelContainer}>
              <label>{this.props.t('PROFILE.ACCOUNT.LANGUAGE')}</label>
              <select style={{ marginLeft: '8px' }} onChange={this.changeLanguage}>
                <option value="en" selected={selectedLanguage === 'en'}>
                  {this.props.t('PROFILE.ACCOUNT.ENGLISH')}
                </option>
                <option value="es" selected={selectedLanguage === 'es'}>
                  {this.props.t('PROFILE.ACCOUNT.SPANISH')}
                </option>
                <option value="pt" selected={selectedLanguage === 'pt'}>
                  {this.props.t('PROFILE.ACCOUNT.PORTUGUESE')}
                </option>
                <option value="fr" selected={selectedLanguage === 'fr'}>
                  {this.props.t('PROFILE.ACCOUNT.FRENCH')}
                </option>
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
