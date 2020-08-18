/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from "react";
import { actions, Control, Form } from 'react-redux-form';
import { connect } from 'react-redux';
import Popup from "reactjs-popup";
import { Button } from 'react-bootstrap';

import { addFarmtoDB } from './actions';
import styles from './styles.scss'
import commonCurrency from './currency/commonCurrency.json';
import DropDown from '../../components/Inputs/DropDown';
import Checkbox from '../../components/Inputs/Checkbox';
import FarmAddress from "../../components/AddFarm/FarmAddress";

const allowedRoles = [
  'Owner', 'Manager',
];

class AddFarm extends Component {
  currencyOptions = [];

  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('profileForms.farm'));
    this.props.dispatch(actions.change('profileForms.farm.unit', { value: "metric", label: "Metric" }));
    this.props.dispatch(actions.change('profileForms.farm.currency', { value: "USD", label: "USD" }));
    this.state = {
      farm: {
        farm_name: '',
        address: '',
        grid_points: [],
        units: {
          currency: '',
          date_format: '',
          measurement: '',
        },
        sandbox_bool: false,
      },
      showRoleModal: false,
      selectedRole: '',
    };
  }

  componentDidMount() {
    this.currencyOptions = Object.keys(commonCurrency).map((key) => ({ value: key, label: key }));
  }

  handleSubmit = () => {
    const { farm, selectedRole } = this.state;
    const userFarm = {
      farm_config: farm,
      role: selectedRole,
    };
    this.props.dispatch(addFarmtoDB(userFarm));
  }

  openChooseRoleModal = (val) => {
    // Do anything you want with the form value
    this.setState({ showRoleModal: true, farm: val.farm });
  }

  closeChooseRoleModal = () => {
    this.setState({ showRoleModal: false });
  }

  onClickSelectRole = (role) => {
    this.setState({ selectedRole: role });
  }

  render() {
    return <div className={styles.formContainer}>
      <Form className={styles.form} model="profileForms" onSubmit={(val) => this.openChooseRoleModal(val)}>
        <label>Your Farm Name</label>
        <Control.text model=".farm.farm_name" validators={{
          required: (val) => val.length,
          length: (val) => val.length > 2
        }}/>
        <label>Farm Address</label>
        <div>
          <FarmAddress/>
        </div>
        <label>Units</label>
        <div>
          <Control
            model=".farm.unit"
            component={DropDown}
            options={[{ value: "metric", label: "Metric" }, { value: "imperial", label: "Imperial" }]}
          />
        </div>
        <label>Currency</label>
        <div>
          <Control model=".farm.currency"
                   component={DropDown}
                   options={this.currencyOptions}
          />
        </div>
        <div>
          <Checkbox
            stylesheet={styles.sandbox}
            title="Is this a sandbox account and not a real farm?"
            model=".farm.sandbox"
          />
        </div>
        <button className={styles.next}>Next</button>
      </Form>
      <Popup
        open={this.state.showRoleModal}
        closeOnDocumentClick
        onClose={() => this.closeChooseRoleModal()}
        contentStyle={{ display: 'flex', width: '100%', height: '100vh', padding: '0 5%' }}
        overlayStyle={{ zIndex: '1060', height: '100vh' }}
      >
        {/* Need a div wrapper to eliminate console warnings from the popup */}
        <div className={styles.modal}>
          <div className={styles.popupTitle}>
            <h3>{`Choose your role at ${this.state.farm.farm_name}`}</h3>
          </div>
          <div className={styles.customContainer}>

          </div>
          {
            allowedRoles.map(role => (
              <Button
                key={role}
                onClick={() => this.onClickSelectRole(role)}
                className={styles.roleButton}
              >
                {role}
              </Button>
            ))
          }
          <div className={styles.bottomContainer}>
            <div className={styles.cancelButton} onClick={() => this.closeChooseRoleModal()}>
              Go Back
            </div>
            <button
              className='btn btn-primary'
              onClick={() => this.handleSubmit()}
              disabled={!this.state.selectedRole}
            >
              Proceed
            </button>
          </div>
        </div>
      </Popup>
    </div>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapDispatchToProps)(AddFarm);
