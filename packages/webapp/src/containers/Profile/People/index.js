import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import { peopleInfoSelector, rolesSelector, profileFormsSelector } from './selector';
import {
  getUserInfo,
  updateUserFarm,
  addUser,
  addPseudoWorker,
  deactivateUser,
  getRoles,
} from './actions';
import Table from '../../../components/Table';
import DropDown from '../../../components/Inputs/DropDown';
import Popup from "reactjs-popup";
import { Control, Errors, Form, actions } from 'react-redux-form';
import {Button} from 'react-bootstrap';
import closeButton from '../../../assets/images/grey_close_button.png';
import {Alert} from 'react-bootstrap';
import {grabCurrencySymbol} from "../../../util";
import {farmSelector} from '../../selector';
import Cleave from 'cleave.js/react.js';
import {toastr} from 'react-redux-toastr';
const generator = require('generate-password');
const uuidv4 = require('uuid/v4');

const summaryColumns = [
  {
    id: 'name',
    Header: 'Name',
    accessor: (e) => e.first_name.concat(' ', e.last_name),
    minWidth: 70,
  },
  {
    id: 'email',
    Header: 'Email',
    accessor: 'email',
    minWidth: 95,
    style: { 'whiteSpace': 'unset' },
  },
  {
    id: 'role',
    Header: 'Role',
    accessor: 'role',
    minWidth: 55,
  },
  {
    id: 'active',
    Header: 'Active',
    accessor: 'status',
    minWidth: 55,
  },
];
const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i)

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
    };
  }

  openEditModal = (user) => {
    // let editTitle = user.is_admin ? 'Admin' : 'Worker'
    let editTitle = 'User';
    this.setState({
      editUser: JSON.parse(JSON.stringify(user)),
      editTitle,
      editedUser: JSON.parse(JSON.stringify({wage: user.wage})),
    }, () => {
      this.setState({showEdit: true});
    });
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

  openAddModal = (isAdmin, isPseudo = false) => {
    this.setState({
      showAdd: true,
      isAdmin,
      isPseudo,
    });
  };

  closeAddModal = () => {
    const { dispatch } = this.props;
    dispatch(getUserInfo());
    dispatch(actions.reset('profileForms.addInfo'));
    this.setState({ showAdd: false });
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
      hasChanged = true;
    }

    // ADD EMAIL CHANGE
    if (this.state.willConvertWorker && editedUser.email && editedUser.email.length && user.role_id === 4) {
      finalUser.email = editedUser.email;
      finalUser.email_needs_update = true;
      if (!finalUser.role_id) {
        finalUser.role_id = 3;
      }
      finalUser.has_consent = false;
      hasChanged = true;
    }

    if (hasChanged) {
      finalUser.user_id = user.user_id;
      this.props.dispatch(updateUserFarm(finalUser));
      this.closeEditModal();
    } else {
      toastr.success("Nothing's changed");
      this.closeEditModal();
    }
    // this.props.dispatch(updateUser(user));
    // this.closeEditModal();
  }

  handleAddPerson(userInfo, farmID) {
    const {
      role,
      email,
      pay,
      first_name,
      last_name,
    } = userInfo;
    // Pseudo worker is a worker with no email filled out
    const isPseudo = role === 3 && email.trim().length === 0;
    const amount = pay.amount && pay.amount.trim().length > 0
      ? Number(pay.amount)
      : 0; // TODO: convert this to null to indicate no wage is entered
    if (!isPseudo) {
      const pw = generator.generate({
        length: 10,
        numbers: true,
        symbols: true,
      });
      const user = {
        email,
        user_metadata: {
          first_name,
          last_name,
        },
        farm_id: farmID,
        role_id: Number(role),
        wage: {
          type: pay.type || 'hourly',
          amount,
        },
        password: pw,
      };
      this.props.dispatch(addUser(user));
      // alert('user created with password: ' + pw);
    } else {
      const pseudoId = uuidv4();
      const user = {
        email: pseudoId + '@pseudo.com',
        first_name,
        last_name,
        farm_id: farmID,
        wage: {
          type: pay.type || 'hourly',
          amount,
        },
        profile_picture: 'https://cdn.auth0.com/avatars/na.png',
        user_id: pseudoId,
      };
      this.props.dispatch(addPseudoWorker(user));
    }

    this.closeAddModal()

  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getUserInfo());
    dispatch(actions.reset('profileForms.addInfo'));
    dispatch(getRoles());
  }

  deactivate = (user_id) => {
    if (window.confirm('Do you want to remove this user from your farm?')) {
      if (window.confirm('This action will remove the user from your farm.')) {
        this.props.dispatch(deactivateUser(user_id));
        this.closeEditModal();
      }
    }
  };

  handleSearchValueChange = (event) => {
    this.setState({searchValue: event.target.value});
  }

  formatData = () => {
    const {searchValue} = this.state;
    const {users} = this.props;
    const {farm_id, addedUser, roles, ...userGroups} = users;
    const combinedUserGroups = Object.keys(userGroups).reduce(
      (prev, curr) => prev.concat(userGroups[curr]),
      [],
    );
    const filteredUsers = combinedUserGroups.filter(user => {
      const firstName = user.first_name.toLowerCase();
      const lastName = user.last_name.toLowerCase();
      const name = firstName.concat(' ', lastName);
      return name.includes(searchValue.trim().toLowerCase());
    });
    return filteredUsers;
  };

  onRowEdit = (state, rowInfo, column, instance) => {
    const { isAdmin } = this.props;
    const isClickable = rowInfo && isAdmin && column.id === 'name';
    const clickableStyle = {
      'whiteSpace': 'unset',
      'cursor': 'pointer',
      'textDecoration': 'underline',
      'color': '#0645AD',
    };
    const normalTextStyle = { 'whiteSpace': 'unset' };
    return {
      onClick: e => {
        if (isClickable) {
          this.openEditModal(rowInfo.original)
        }
      },
      style: isClickable ? clickableStyle : normalTextStyle,
    }
  }

  validationCheck = (event) => {
    let to_check = event.target.value;
    let error_message;
    if (event.target.type === 'text') {
      error_message = validEmailRegex.test(to_check) ? '' : "Email must be valid";
      this.setState({edit_email_error: error_message});
    } else {
      error_message = validWageRegex.test(to_check) ? '' : "Wage must be a valid, non-negative decimal";
      this.setState({edit_wage_error: error_message})
    }
  };

  enableUpdate = () => {
    this.setState({updated_edit: true})
  };

  updateEmail = (event) => {
    let email = event.target.value;
    let {editedUser} = this.state;

    editedUser.email = email;
    this.setState({
      editedUser: editedUser,
    });

    if (!this.state.edit_email_error) {
      this.enableUpdate()
    }
  };

  updateRoleSelection = (event) => {
    let role_id = Number(event.target.value);
    let {editedUser} = this.state;

    editedUser.role_id = role_id;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate()
  };

  updateWageAmount = (event) => {
    let amount = Number(event.target.value);
    let {editedUser} = this.state;

    editedUser.wage.amount = amount;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate()
  };

  updateWageType = (event) => {
    let type = event.target.value
    let {editedUser} = this.state;

    editedUser.wage.type = type;
    this.setState({
      editedUser: editedUser,
    });
    this.enableUpdate()
  };

  toggleConvertWorker = (e) => {
    let {editedUser, edit_email_error, cleaveEmailState} = this.state;
    delete editedUser.email;
    if (!e.target.checked) {
      edit_email_error = '';
      cleaveEmailState.setRawValue('');
    }

    this.setState({
      willConvertWorker: e.target.checked,
      editedUser,
      edit_email_error,
    })
  };

  onEditEmailInit = (cleave) => {
    this.setState({cleaveEmailState: cleave});
  };

  isDisabled = () => {
    const { profileForms } = this.props;
    const { forms } = profileForms;
    const { addInfo } = forms;
    return !addInfo.$form.valid;
  }

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
  }

  getTextFieldStyle = (key) => {
    const hasErrors = this.isTextFieldErrorShown(key);
    if (hasErrors) {
      return styles.errorInputContainer;
    }
    return styles.inputContainer;
  }

  getDropDownOptions = () => {
    const { roles } = this.props;
    return roles.map(option => {
      const { role_id, role } = option;
      return ({
        value: role_id,
        label: `Farm ${role}`,
      });
    })
  }

  render() {
    const { isAdmin, profileForms } = this.props;
    const { editTitle, currencySymbol, searchValue } = this.state;
    const filteredData = this.formatData();
    const { addInfo } = profileForms;
    const isRoleSelected = addInfo.role !== '0';
    const dropDownOptions = this.getDropDownOptions();

    if (this.state.showAdd) {
      return (
        <div className={styles.addUserContainer}>
          <div className={styles.addUserTitleContainer}>
            <h3 className={styles.userTitle}>Invite a User</h3>
          </div>
          <Form
            className={styles.formContainer}
            model="profileForms"
            onSubmit={(val) => this.handleAddPerson(val.addInfo, this.props.users.farm_id)}
          >
            <div className={styles.formBodyContainer}>
              <div className={this.getTextFieldStyle('first_name')}>
                <label>First Name</label>
                <Control.text
                  model=".addInfo.first_name"
                  validators={{
                    required: (val) => val.length,
                  }}
                  defaultValue=""
                />
              </div>
              <Errors
                model="profileForms.addInfo.first_name"
                messages={{
                  required: 'First name cannot be empty',
                }}
                show={field => field.touched && !field.focus}
                component={(props) => (
                  <div className={styles.errorContainer}>
                    <div className={styles.errorText}>{props.children}</div>
                  </div>
                )}
              />
              <div className={this.getTextFieldStyle('last_name')}>
                <label>Last Name</label>
                <Control.text
                  model=".addInfo.last_name"
                  validators={{
                    required: (val) => val.length
                  }}
                  defaultValue=""
                />
              </div>
              <Errors
                model=".addInfo.last_name"
                messages={{
                  required: 'Last name cannot be empty',
                }}
                show={field => field.touched && !field.focus}
                component={(props) => (
                  <div className={styles.errorContainer}>
                    <div className={styles.errorText}>{props.children}</div>
                  </div>
                )}
              />
              <div className={styles.inputContainer}>
                <label>Role</label>
                <Control.custom
                  model=".addInfo.role"
                  defaultValue="0"
                  onChange={(option) => {
                    this.props.dispatch(actions.change('profileForms.addInfo.role', option.value))
                    this.props.dispatch(actions.validate('profileForms.addInfo.email', {
                      required: (val) => option.value === 3 ? true : val.length,
                      validEmail: (val) => validEmailRegex.test(val),
                    }));
                  }}
                  component={DropDown}
                  mapProps={{
                    isSearchable: false,
                    options: dropDownOptions,
                    placeholder: 'Select role',
                    styles: {
                      container: (provided, state) => ({
                        ...provided,
                        margin: '0.25em 0 1em 0',
                        outline: 'none',
                      }),
                      control: (provided, state) => ({
                        background: '#FFFFFF',
                        border: '1px solid',
                        borderColor: state.isFocused ? '#89D1C7' : '#D4DAE3',
                        boxSizing: 'border-box',
                        borderRadius: '4px',
                        padding: '0.75em 0.5em',
                        height: '48px',
                        fontSize: '16px',
                        color: '#282B36',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                      }),
                      placeholder: (provided, state) => ({ color: '#9FAABE'}),
                      indicatorSeparator: (provided, state) => ({
                        backgroundColor: 'none',
                      }),
                      menuList: (provided, state) => ({
                        ...provided,
                        padding: 0,
                        margin: 0,
                        borderRadius: '4px',
                        background: '#FFFFFF',
                        boxShadow: '0px 1px 2px rgba(102, 115, 138, 0.25)',
                      }),
                      option: (provided, state) => ({
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 8px 8px',
                        backgroundColor: 'transparent',
                        background: (state.isClicked || state.isFocused) ? 'rgb(223, 244, 232, 0.5)' : 'none',
                        color: '#282B36',
                        height: '40px',
                      }),
                      valueContainer: (provided, state) => ({
                        ...provided,
                        padding: 0,
                      }),
                      singleValue: (provided, state) => ({
                        ...provided,
                        padding: 0,
                        margin: 0,
                      }),
                    }
                  }}
                />
          </div>
              {
                isRoleSelected
                  && (
                    <div>
                    <div className={this.getTextFieldStyle('email')}>
                        <label>{addInfo.role === 3 ? `Email (Optional)` : `Email`}</label>
                        <Control.text
                          model=".addInfo.email"
                          validators={{
                            required: (val) => addInfo.role === 3 ? true : val.length,
                            validEmail: (val) => validEmailRegex.test(val),
                          }}
                          defaultValue=""
                        />
                        {
                          addInfo.role === 3
                            && (
                              <p className={styles.emailInputReminder}>
                                {`Users without an email won't be able to login`}
                              </p>
                            )
                        }
                      </div>
                      <Errors
                        model=".addInfo.email"
                        messages={{
                          required: 'Email cannot be empty for the selected role',
                          validEmail: 'Email must be valid',
                        }}
                        show={field => field.touched && !field.focus}
                        component={(props) => (
                          <div className={styles.errorContainer}>
                            <div className={styles.errorText}>{props.children}</div>
                          </div>
                        )}
                      />
                    <div className={this.getTextFieldStyle('pay')}>
                        <label>Wage (Optional)</label>
                        <div className={styles.wageContainer}>
                          <Control.text
                            model=".addInfo.pay.amount"
                            validators={{
                              validWage: (val) => validWageRegex.test(val),
                            }}
                            defaultValue=""
                          />
                          <p className={styles.wageInputUnit}>
                            {`${currencySymbol}/hr`}
                          </p>
                          {/* <div className={styles.payTypeContainer}>
                                <div className={styles.radioContainer}>
                                  <Control.radio model=".addInfo.pay.type" name="payType" id="hourly" value="hourly" />
                                  <label htmlFor="hour">Hourly</label>
                                </div>
                                <div className={styles.radioContainer}>
                                  <Control.radio model=".addInfo.pay.type" name="payType" id="daily" value="daily" />
                                  <label htmlFor="daily">Daily</label>
                                </div>
                              </div> */}
                        </div>
                      </div>
                      <Errors
                        model=".addInfo.pay.amount"
                        messages={{
                          validWage: 'Wage must be a valid, non-negative number (up to 2 decimal places)',
                        }}
                        show={field => field.touched && !field.focus}
                        component={(props) => (
                          <div className={styles.errorContainer}>
                            <div className={styles.errorText}>{props.children}</div>
                          </div>
                        )}
                      />
                    </div>
                  )
              }
            </div>
            <div className={styles.formActionsContainer}>
              <button
                className={styles.cancelButton}
                onClick={() => this.closeAddModal()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.inviteButton}
                disabled={this.isDisabled()}
              >
                Invite
              </button>
            </div>
          </Form>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.userListContainer}>
          <div className={styles.searchFieldContainer}>
            <i className="material-icons">search</i>
            <input
              id="searchField"
              type="search"
              value={searchValue}
              onChange={(event) => this.handleSearchValueChange(event)}
              className={styles.searchField}
            />
          </div>
          <label htmlFor="searchField" className={styles.searchLabel}>{`${filteredData.length} users found`}</label>
          <Table
            columns={summaryColumns}
            data={filteredData}
            showPagination={true}
            pageSizeOptions={[5, 10, 20, 50]}
            defaultPageSize={5}
            className="-striped -highlight"
            getTdProps={this.onRowEdit}
          />
          {
            isAdmin
              ? (
                <button
                  className={styles.addButton}
                  onClick={() => this.openAddModal(true)}
                >
                  Invite User
                </button>
              )
              : null
          }
        </div>
        <Popup
          open={this.state.showEdit}
          closeOnDocumentClick
          onClose={this.closeEditModal}
          contentStyle={{display: 'flex', width: '100%', minHeight: '100vh', maxHeight: '120vh', padding: '0 5%', justifyContent: 'center'}}
          overlayStyle={{zIndex: '1060', minHeight: '100vh', maxHeight: '120vh', top: 'auto'}}
        >
          <div className={styles.modal}>
            <div className={styles.popupTitle}>
              <a className={styles.close} onClick={this.closeEditModal}>
                <img src={closeButton} alt=""/>
              </a>
              <h3>Edit {editTitle}</h3>
            </div>
            {
              this.state.editUser && (
                <div className={styles.formContainer}>
                  <Form model="profileForms"
                        onSubmit={() => this.handleSubmit(this.state.editedUser, this.state.editUser)}>
                    {
                      this.state.editUser.role_id === 4 && <div className={styles.labelContainer}>
                        <label>Convert this worker to a user with account</label>
                        <input type="checkbox" value={this.state.willConvertWorker}
                               onChange={(e) => this.toggleConvertWorker(e)}/>
                      </div>
                    }
                    <div className={styles.labelContainer}>
                      <label>First<br/>Name</label>
                      <Cleave type='text' model=".editInfo.first_name" disabled={true}
                              value={this.state.editUser.first_name}/>
                    </div>
                    <div className={styles.labelContainer}>
                      <label>Last<br/>Name</label>
                      <Cleave type='text' model=".editInfo.last_name" disabled={true}
                              value={this.state.editUser.last_name}/>
                    </div>
                    <div className={styles.labelContainer}>
                      <label>Email</label>
                      <Cleave type='text'
                              model=".editInfo.email"
                              onInit={this.onEditEmailInit}
                              onChange={this.updateEmail}
                              onBlur={this.validationCheck}
                              value={this.state.editUser.email}
                              disabled={this.state.editUser.role_id !== 4 || !this.state.willConvertWorker}/>
                    </div>
                    {this.state.edit_email_error.length > 0 &&
                    <span className={styles.error}>{this.state.edit_email_error}</span>}
                    {
                      (this.state.editUser.role_id !== 4 || this.state.willConvertWorker) && <div>
                        <Alert bsStyle="warning">
                          Role change will take full effect upon next login. Workers cannot set themselves to Admins.
                        </Alert>
                        <div className={styles.selectContainer}>
                          <label>Role</label>
                          <Control.select model=".editInfo.role" onChange={this.updateRoleSelection}
                                          defaultValue={this.state.editUser.role_id === 4 ? 3 : this.state.editUser.role_id}>
                            <option value="3">Farm Worker</option>
                            <option value="2">Farm Manager</option>
                            <option value="1">Farm Owner</option>
                          </Control.select>
                        </div>
                      </div>
                    }
                    <div className={styles.selectContainer}>
                      <label>Pay ({currencySymbol})</label>
                      <Cleave model=".editInfo.pay.amount"
                              type="number" step='0.01'
                              value={this.state.editedUser.wage.amount}
                              onChange={this.updateWageAmount}
                              onBlur={this.validationCheck}/>
                      <Control.select model=".editInfo.pay.type" onChange={this.updateWageType}
                                      defaultValue={this.state.editedUser.wage.type}>
                        <option value="hourly">hourly</option>
                        {/*<option value="daily">daily</option>*/}
                        {/*<option value="annually">annually</option>*/}
                      </Control.select>
                    </div>
                    {this.state.edit_wage_error.length > 0 &&
                    <span className={styles.error}>{this.state.edit_wage_error}</span>}
                    <div className={defaultStyles.saveButton}>
                      <Button type='submit' bsStyle='primary' disabled={!this.state.updated_edit}>Update</Button>
                    </div>
                  </Form>
                  <div style={{"textAlign": "center"}}>
                    {
                      !this.state.editUser.is_admin && <button className={styles.removeButton}
                                                               onClick={() => this.deactivate(this.state.editUser.user_id)}>
                        Revoke User Access</button>
                    }
                  </div>

                </div>
              )
            }
          </div>
        </Popup>
      </div>
    );
  }

}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

const mapStateToProps = (state) => {
  return {
    users: peopleInfoSelector(state),
    farm: farmSelector(state),
    roles: rolesSelector(state),
    profileForms: profileFormsSelector(state),
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(People);
