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

import React, {Component} from 'react';
import styles from './styles.scss';
import BottomScrollListener from 'react-bottom-scroll-listener';
import ConsentFooter from '../../components/ConsentFooter';
import {connect} from 'react-redux';
import {updateAgreement, getUserInfo} from '../../containers/actions';
import {userInfoSelector, farmSelector} from '../selector';
import workerConsentForm from './Versions/WorkerConsentForm.docx';
import ownerConsentForm from './Versions/OwnerConsentForm.docx';
const mammoth = require("mammoth");

class ConsentForm extends Component {
  constructor(props) {
    super(props);
    this.triggerFooterAgree = this.triggerFooterAgree.bind(this);
    this.props.dispatch(getUserInfo());
    this.state = {
      consent: '',
      enableAgree: false,
      consent_version: null,
    };
  }

  componentDidMount() {

    const { role, location } = this.props;
    const { state } = location;
    const role_id = (state && state.role_id) || (role && role.role_id) || 0;

    let consentForm = role_id === 3 ? workerConsentForm : ownerConsentForm;

    let currentComponent = this;
      fetch(consentForm).then(res => res.arrayBuffer()).then(ab =>
        mammoth.convertToHtml({ arrayBuffer: ab }).then(function(result) {
        const html = result.value;
        const spaceIndex = html.indexOf(' ') + 1;
        const colonIndex = html.indexOf(':');
        const consent_version = html.substring(spaceIndex, colonIndex);
        currentComponent.setState({ consent: html, consent_version })
      })
      .done(),
    )
  }

  triggerFooterAgree() {
    if ((this.props.role && !this.props.role.has_consent) ||
      (this.state.consent_version && this.state.consent_version !== this.props.role.consent_version)
    ) {
      this.setState({enableAgree: true});
    }
  }

  updateConsent = (bool) => {
    this.props.dispatch(updateAgreement(bool, this.state.consent_version));
  };

  isConsentFooterDisplayed = () => {
    const { role } = this.props;

    if (!role) {
      return false;
    }

    return !role.has_consent;
  };


  render() {
    const isConsentFooterDisplayed = this.isConsentFooterDisplayed();
    return (
      <div className={styles.consentContainer}>
        <div className={styles.fixedHeader}>
          <h3>Consent Form</h3>
        </div>
         <BottomScrollListener onBottom={() => this.triggerFooterAgree()}>
           {scrollRef => (
             <div data-test="consent_form" ref={scrollRef} className={styles.content}>
             <div dangerouslySetInnerHTML={{ __html:  this.state.consent }} />
             </div>
           )}
        </BottomScrollListener>
        <br/>
        {
          isConsentFooterDisplayed
            && (
              <ConsentFooter
                ref="footer"
                updateConsent={this.updateConsent}
                enableAgree={this.state.enableAgree}
              />
            )
        }
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
    users: userInfoSelector(state),
    role: farmSelector(state),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConsentForm);