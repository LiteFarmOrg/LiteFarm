import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import defaultStyles from '../styles.module.scss';
import { rolesSelector } from './slice';

import { deactivateUser, reactivateUser, invitePseudoUser } from './saga';
import { updateUserFarm } from './saga';
import Table from '../../../components/Table';
import DropDown from '../../../components/Inputs/DropDown';
import Popup from 'reactjs-popup';
import { actions, Control, Errors, Form } from 'react-redux-form';
import { Alert, Button } from 'react-bootstrap';
import closeButton from '../../../assets/images/grey_close_button.png';
import { grabCurrencySymbol } from '../../../util';
import Cleave from 'cleave.js/react.js';
import { toastr } from 'react-redux-toastr';
import { userFarmsByFarmSelector, userFarmSelector } from '../../userFarmSlice';
import { getAllUserFarmsByFarmId } from './saga';
import { withTranslation } from 'react-i18next';
import history from '../../../history';
const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);

class People extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEdit: false,
      showAdd: false,
      editUser: null,
      editedUser: null,
      addUser: null,
      isAdmin: false,
      isPseudo: false,
      editTitle: '',
      currencySymbol: grabCurrencySymbol(this.props.farm),
      searchValue: '',
      edit_email_error: '',
      edit_wage_error: '',
      updated_edit: false,
      willConvertWorker: false,
      cleaveEmailState: null,
      summaryColumns: [
        {
          id: 'name',
          Header: this.props.t(`PROFILE.TABLE.HEADER_NAME`),
          accessor: (e) => e.first_name.concat(' ', e.last_name),
          minWidth: 70,
        },
        {
          id: 'email',
          Header: this.props.t(`PROFILE.TABLE.HEADER_EMAIL`),
          accessor: 'email',
          minWidth: 95,
          style: { whiteSpace: 'unset' },
        },
        {
          id: 'role',
          Header: this.props.t(`PROFILE.TABLE.HEADER_ROLE`),
          accessor: 'role',
          minWidth: 55,
        },
        {
          id: 'status',
          Header: this.props.t(`PROFILE.TABLE.HEADER_STATUS`),
          accessor: 'status',
          minWidth: 55,
        },
      ],
    };
  }

  openEditModal = (user) => {
    // let editTitle = user.is_admin ? 'Admin' : 'Worker'
    let editTitle = 'User';
    this.setState(
      {
        editUser: JSON.parse(JSON.stringify(user)),
        editTitle,
        editedUser: JSON.parse(JSON.stringify({ wage: user.wage })),
      },
      () => {
        this.setState({ showEdit: true });
      },
    );
  };

  closeEditModal = () => {
    this.setState({
      showEdit: false,
      updated_edit: false,
      edit_email_error: '',
      edit_wage_error: '',
      willConvertWorker: false,
    });
  };

  handleSubmit(editedUser, user) {
    if (this.state.edit_wage_error || this.state.edit_email_error) {
      return;
    }

    let hasChanged = false;
    let finalUser = {};

    if (editedUser.wage.type !== user.wage.type || editedUser.wage.amount !== user.wage.amount) {
      finalUser.wage = {
        type: editedUser.wage.type,
        amount: editedUser.wage.amount,
      };
      hasChanged = true;
    }

    // ADD ROLE CHANGE
    if (editedUser.role_id && editedUser.role_id !== user.role_id) {
      finalUser.role_id = editedUser.role_id;
      finalUser.has_consent = false;
      hasChanged = true;
    }

    // ADD EMAIL CHANGE
    const shouldConvertPseudoWorker =
      this.state.willConvertWorker &&
      editedUser.email &&
      editedUser.email.length &&
      user.role_id === 4;

    if (shouldConvertPseudoWorker) {
      finalUser.email = editedUser.email;
      if (!finalUser.role_id) {
        finalUser.role_id = 3;
      }
      finalUser.user_id = user.user_id;
      hasChanged = true;
      this.props.dispatch(invitePseudoUser(finalUser));
      return this.closeEditModal();
    } else if (hasChanged) {
      finalUser.user_id = user.user_id;
      this.props.dispatch(updateUserFarm(finalUser));
      this.closeEditModal();
    } else {
      toastr.success(this.props.t('message:USER.ERROR.NOTHING_CHANGED'));
      this.closeEditModal();
    }
  }

  componentDidMount() {
    const { dispatch, t } = this.props;
    dispatch(getAllUserFarmsByFarmId());
    dispatch(actions.reset('profileForms.addInfo'));
  }

  deactivate = (user_id) => {
    if (window.confirm('Do you want to remove this user from your farm?')) {
      if (window.confirm('This action will remove the user from your farm.')) {
        this.props.dispatch(deactivateUser(user_id));
        this.closeEditModal();
      }
    }
  };

  reactivate = (user_id) => {
    this.props.dispatch(reactivateUser(user_id));
    this.closeEditModal();
  };

  handleSearchValueChange = (event) => {
    this.setState({ searchValue: event.target.value });
  };

  formatData = () => {
    const { searchValue } = this.state;
    const { users, t } = this.props;
    const { farm_id, addedUser, roles, ...userGroups } = users;
    const ROLE_TRANSLATIONS = {
      Owner: t('role:OWNER'),
      'Extension Officer': t('role:EXTENSION_OFFICER'),
      Manager: t('role:MANAGER'),
      Worker: t('role:WORKER'),
      'Worker Without Account': t('role:WORKER_WITHOUT_ACCOUNT'),
    };
    const STATUS_TRANSLATIONS = {
      Active: t('STATUS.ACTIVE'),
      Inactive: t('STATUS.INACTIVE'),
      Invited: t('STATUS.INVITED'),
    };
    const combinedUserGroups = Object.keys(userGroups).reduce(
      (prev, curr) => prev.concat(userGroups[curr]),
      [],
    );
    const filteredUsers = combinedUserGroups.filter((user) => {
      const firstName = user.first_name.toLowerCase();
      const lastName = user.last_name.toLowerCase();
      const name = firstName.concat(' ', lastName);
      return name.includes(searchValue.trim().toLowerCase());
    });
    return filteredUsers.map((user) => ({
      ...user,
      role: ROLE_TRANSLATIONS[user.role],
      status: STATUS_TRANSLATIONS[user.status],
      originalStatus: user.status
    }));
  };

  onRowEdit = (state, rowInfo, column, instance) => {
    const { isAdmin } = this.props;
    const isClickable = rowInfo && isAdmin && column.id === 'name';
    const clickableStyle = {
      whiteSpace: 'unset',
      cursor: 'pointer',
      textDecoration: 'underline',
      color: '#0645AD',
    };
    const normalTextStyle = { whiteSpace: 'unset' };
    return {
      onClick: (e) => {
        if (isClickable) {
          this.openEditModal(rowInfo.original);
        }
      },
      style: isClickable ? clickableStyle : normalTextStyle,
    };
  };

  validationCheck = (event) => {
    let to_check = event.target.value;
    let error_message;
    if (event.target.type === 'text') {
      error_message = validEmailRegex.test(to_check) ? '' : 'Email must be valid';
      this.setState({ edit_email_error: error_message });
    } else {
      error_message = validWageRegex.test(to_check)
        ? ''
        : 'Wage must be a valid, non-negative decimal';
      this.setState({ edit_wage_error: error_message });
    }
  };

  enableUpdate = () => {
    this.setState({ updated_edit: true });
  };

  updateEmail = (event) => {
    let email = event.target.value;
    let { editedUser } = this.state;

    editedUser.email = email;
    this.setState({
      editedUser: editedUser,
    });

    if (!this.state.edit_email_error) {
      this.enableUpdate();
    }
  };

  updateRoleSelection = (event) => {
    let role_id = Number(event.target.value);
    let { editedUser } = this.state;

    editedUser.role_id = role_id;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate();
  };

  updateWageAmount = (event) => {
    let amount = Number(event.target.value);
    let { editedUser } = this.state;

    editedUser.wage.amount = amount;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate();
  };

  updateWageType = (event) => {
    let type = event.target.value;
    let { editedUser } = this.state;

    editedUser.wage.type = type;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate();
  };

  toggleConvertWorker = (e) => {
    let { editedUser, edit_email_error, cleaveEmailState } = this.state;
    delete editedUser.email;
    if (!e.target.checked) {
      edit_email_error = '';
      cleaveEmailState.setRawValue('');
    }

    this.setState({
      willConvertWorker: e.target.checked,
      editedUser,
      edit_email_error,
    });
  };

  onEditEmailInit = (cleave) => {
    this.setState({ cleaveEmailState: cleave });
  };

  isDisabled = () => {
    const { profileForms } = this.props;
    const { forms } = profileForms;
    const { addInfo } = forms;
    return !addInfo.$form.valid;
  };

  isTextFieldErrorShown = (key) => {
    const { profileForms } = this.props;
    const { forms } = profileForms;
    const { addInfo } = forms;
    let field = addInfo[key];

    if (key === 'pay') {
      field = addInfo[key].amount;
    }

    // Show error only when it's invalid, touched, and not currently focused on
    // NOTE: Besides the first condition (field.valid), all the following
    // conditions should follow the show prop in the <Errors /> component to
    // ensure that the input field's styling is consistent with <Errors />
    return !field.valid && field.touched && !field.focus;
  };

  getTextFieldStyle = (key) => {
    const hasErrors = this.isTextFieldErrorShown(key);
    if (hasErrors) {
      return styles.errorInputContainer;
    }
    return styles.inputContainer;
  };

  render() {
    const { isAdmin, profileForms } = this.props;
    const { editTitle, currencySymbol, searchValue } = this.state;
    const filteredData = this.formatData();
    const { addInfo } = profileForms;

    return (
      <div>
        <div className={styles.userListContainer}>
          <div className={styles.searchFieldContainer}>
            <input
              id="searchField"
              type="search"
              placeholder={this.props.t('PROFILE.PEOPLE.SEARCH')}
              value={searchValue}
              onChange={(event) => this.handleSearchValueChange(event)}
              className={styles.searchField}
            />
          </div>
          <label htmlFor="searchField" className={styles.searchLabel}>{`${
            filteredData.length
          } ${this.props.t('PROFILE.PEOPLE.USERS_FOUND')}`}</label>
          <Table
            columns={this.state.summaryColumns}
            data={filteredData}
            showPagination={true}
            pageSizeOptions={[5, 10, 20, 50]}
            defaultPageSize={5}
            className="-striped -highlight"
            getTdProps={this.onRowEdit}
          />
          {isAdmin ? (
            <button className={styles.addButton} onClick={() => history.push('/invite_user')}>
              {this.props.t('PROFILE.PEOPLE.INVITE_USER')}
            </button>
          ) : null}
        </div>
        <Popup
          open={this.state.showEdit}
          closeOnDocumentClick
          onClose={this.closeEditModal}
          contentStyle={{
            display: 'flex',
            width: '100%',
            minHeight: '100vh',
            padding: '92px 24px 0 24px',
            justifyContent: 'center',
          }}
          overlayStyle={{
            minHeight: '100vh',
            top: 'auto',
            zIndex: 1,
          }}
        >
          <div className={styles.modal}>
            <div className={styles.popupTitle}>
              <a className={styles.close} onClick={this.closeEditModal}>
                <img src={closeButton} alt="" />
              </a>
              <h3>
                {this.props.t('common:EDIT')} {editTitle}
              </h3>
            </div>
            {this.state.editUser && (
              <div className={styles.formContainer}>
                <Form
                  model="profileForms"
                  onSubmit={() => this.handleSubmit(this.state.editedUser, this.state.editUser)}
                >
                  {this.state.editUser.role_id === 4 && (
                    <div className={styles.labelContainer}>
                      <label style={{ width: 'auto' }}>
                        {this.props.t('PROFILE.ACCOUNT.CONVERT_TO_HAVE_ACCOUNT')}
                      </label>
                      <input
                        style={{ appearance: 'auto', width: '32px', marginLeft: '12px' }}
                        type="checkbox"
                        value={this.state.willConvertWorker}
                        onChange={(e) => this.toggleConvertWorker(e)}
                      />
                    </div>
                  )}
                  <div className={styles.labelContainer}>
                    <label>{this.props.t('PROFILE.ACCOUNT.FIRST_NAME')}</label>
                    <Cleave
                      type="text"
                      model=".editInfo.first_name"
                      disabled={true}
                      value={this.state.editUser.first_name}
                    />
                  </div>
                  <div className={styles.labelContainer}>
                    <label>{this.props.t('PROFILE.ACCOUNT.LAST_NAME')}</label>
                    <Cleave
                      type="text"
                      model=".editInfo.last_name"
                      disabled={true}
                      value={this.state.editUser.last_name}
                    />
                  </div>
                  <div className={styles.labelContainer}>
                    <label>{this.props.t('PROFILE.ACCOUNT.EMAIL')}</label>
                    <Cleave
                      type="text"
                      model=".editInfo.email"
                      onInit={this.onEditEmailInit}
                      onChange={this.updateEmail}
                      onBlur={this.validationCheck}
                      value={this.state.editUser.email}
                      disabled={this.state.editUser.role_id !== 4 || !this.state.willConvertWorker}
                    />
                  </div>
                  {this.state.edit_email_error.length > 0 && (
                    <span className={styles.error}>{this.state.edit_email_error}</span>
                  )}
                  {(this.state.editUser.role_id !== 4 || this.state.willConvertWorker) && (
                    <div>
                      <Alert variant="warning">
                        {this.props.t('PROFILE.PEOPLE.ROLE_CHANGE_ALERT')}
                      </Alert>
                      <div className={styles.selectContainer}>
                        <label>{this.props.t('PROFILE.PEOPLE.ROLE')}</label>
                        <Control.select
                          model=".editInfo.role"
                          onChange={this.updateRoleSelection}
                          defaultValue={
                            this.state.editUser.role_id === 4 ? 3 : this.state.editUser.role_id
                          }
                        >
                          <option value="5">{this.props.t('PROFILE.PEOPLE.EO')}</option>
                          <option value="3">{this.props.t('PROFILE.PEOPLE.FARM_WORKER')}</option>
                          <option value="2">{this.props.t('PROFILE.PEOPLE.FARM_MANAGER')}</option>
                          <option value="1">{this.props.t('PROFILE.PEOPLE.FARM_OWNER')}</option>
                        </Control.select>
                      </div>
                    </div>
                  )}
                  <div className={styles.selectContainer}>
                    <label>
                      {this.props.t('PROFILE.PEOPLE.PAY')} ({currencySymbol})
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Cleave
                        model=".editInfo.pay.amount"
                        type="number"
                        step="0.01"
                        value={this.state.editedUser.wage.amount}
                        onChange={this.updateWageAmount}
                        onBlur={this.validationCheck}
                      />
                      <Control.select
                        model=".editInfo.pay.type"
                        onChange={this.updateWageType}
                        defaultValue={this.state.editedUser.wage.type}
                      >
                        <option value="hourly">{this.props.t('PROFILE.PEOPLE.HOURLY')}</option>
                        {/*<option value="daily">daily</option>*/}
                        {/*<option value="annually">annually</option>*/}
                      </Control.select>
                    </div>
                  </div>
                  {this.state.edit_wage_error.length > 0 && (
                    <span className={styles.error}>{this.state.edit_wage_error}</span>
                  )}
                  <div className={defaultStyles.saveButton}>
                    <Button type="submit" variant="primary" disabled={!this.state.updated_edit}>
                      {this.props.t('common:UPDATE')}
                    </Button>
                  </div>
                </Form>
                {this.state.editUser.originalStatus === 'Inactive' && this.state.editUser.role_id !== 4 ? (
                  <div style={{ textAlign: 'center' }}>
                    {!this.state.editUser.is_admin && (
                      <button
                        className={styles.removeButton}
                        onClick={() => this.reactivate(this.state.editUser.user_id)}
                      >
                        {this.props.t('PROFILE.PEOPLE.RESTORE_ACCESS')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    {!this.state.editUser.is_admin && this.state.editUser.role_id !== 4 && (
                      <button
                        className={styles.removeButton}
                        onClick={() => this.deactivate(this.state.editUser.user_id)}
                      >
                        {this.props.t('PROFILE.PEOPLE.REVOKE_ACCESS')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Popup>
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
    users: userFarmsByFarmSelector(state),
    farm: userFarmSelector(state),
    roles: rolesSelector(state),
    profileForms: state.profileForms,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(People));
