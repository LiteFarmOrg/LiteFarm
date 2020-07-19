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

import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from './styles.scss';
import { getFarms } from './actions';
import { userFarmSelector } from './selectors';
import ProceedFooter from '../../components/proceedCancelFooter';
import history from '../../history';
import Auth from '../../Auth/Auth.js';
import workerConsentForm from '../ConsentForm/Versions/WorkerConsentForm.docx';
import ownerConsentForm from '../ConsentForm/Versions/OwnerConsentForm.docx';
import {getUserInfo} from "../actions";
import { toastr } from 'react-redux-toastr';
import axios from 'axios';

const mammoth = require("mammoth");

class ChooseFarm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_farm_id: null,
      disable_proceed: true,
    };
  }

  componentDidMount(){
    this.props.dispatch(getFarms());
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.farms !== prevProps.farms) {
      if(this.props.farms && this.props.farms.length === 1){
        this.selectSingleFarm(this.props.farms[0]);
      }
      else if (this.props.farms && this.props.farms.length === 1){
        history.push('/add_farm');
      }
    }
  }

  selectSingleFarm = (farm) => {
    const { status } = farm;
    const element = document.getElementById('farm_select');
    element.value = farm.farm_id;
    element.selected = true;
    this.setState({
      selected_farm_id: farm.farm_id,
      disable_proceed: status === 'Inactive',
    });
  };

  cancelFunc = () =>{
    const auth = new Auth();
    auth.logout();
  };

  proceedFunc = async () =>{
    console.log('proceed');
    const { selected_farm_id } = this.state;
    const { farms } = this.props;

    if (selected_farm_id){
      localStorage.setItem('farm_id', selected_farm_id);

      const currentFarm = farms.find(farm => farm.farm_id === selected_farm_id);
      if (!currentFarm) {
        toastr.error('Cannot find information associated with selected farm');
        return;
      }

      const { role_id, has_consent } = currentFarm;

      // Get latest consent version
      const { consent_version: lastAgreedVersion } = currentFarm;
      const consentForm = role_id === 3 ? workerConsentForm : ownerConsentForm;
      const header = {
        responseType: 'arraybuffer',
      };
      const response = await axios.get(consentForm, header);
      const htmlString = await mammoth.convertToHtml({ arrayBuffer: response.data });
      const html = htmlString.value;
      // Extract version string in the format of <p>Version: 1.0</p>
      const versionTagMatches = html.match(/^<p>\s*Version\s*[0-9]\.[0-9]\s*\:\s*<\/p>/g);
      if (!versionTagMatches || !versionTagMatches.length) {
        toastr.error('No version information found');
      }
      // Extract version number
      const versionNumberMatches = versionTagMatches[0].match(/[0-9]\.[0-9]/);
      if (!versionNumberMatches || !versionNumberMatches.length) {
        toastr.error('No version number found');
      }
      const latestVersion = versionNumberMatches[0];
      this.props.dispatch(getUserInfo(false));

      // Need consent if at least one of the following criteria is met:
      // 1. User has not explicitly clicked agree or disagree (i.e. null)
      // 2. User has explicitly clicked disagree (i.e. false)
      // 3. User has explicitly clicked agree BUT consent form version has updated since then
      const need_new_consent = !has_consent || (lastAgreedVersion !== latestVersion);

      if (need_new_consent) {
        history.push('/consent', { role_id });
      } else {
        history.push('/home');
      }
    }
  };

  setSelectedFarm = (e) => {
    console.log(e.target.value);
    const farm_id = e.target.value;
    this.setState({
      selected_farm_id: farm_id,
      disable_proceed: false,
    })
  };

  createFarm = () =>{
    history.push('/add_farm');
  };

  render(){
    const { farms } = this.props;
    let { disable_proceed } = this.state;

    return <div className={styles.basicContainer}>

      <div className={styles.titleContainer}>
        <h3>Choose your farm</h3>
      </div>

      <div className={styles.inputWrapper}>
        {
          farms && farms.length &&
          <select size={farms.length} className={styles.farmSelection} id="farm_select" onChange={(e)=>this.setSelectedFarm(e)}>
            {
              farms.map((farm)=>{
                const { farm_id, farm_name, status } = farm;
                return (
                  <option
                    key={farm_id}
                    value={farm_id}
                    disabled={status !== 'Active'}
                  >
                    {farm_name}
                  </option>
                );
              })
            }
          </select>
        }

      </div>

      <div className={styles.createContainer} onClick={()=>this.createFarm()}>
        <span>+</span> &nbsp;Create new farm
      </div>
      <ProceedFooter cancelFunc={this.cancelFunc} proceedFunc={this.proceedFunc} disableProceed={disable_proceed}/>
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
    farms: userFarmSelector(state)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFarm);
