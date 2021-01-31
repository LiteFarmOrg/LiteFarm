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

import React from 'react';
import styles from './styles.scss';
import ConfirmModal from '../Modals/Confirm';

class ConsentFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  render() {
    const { enableAgree, hasConsent, updateConsent } = this.props;
    const setShowModal = (showModal = true) => this.setState({ showModal: showModal });
    return hasConsent ? (
      <WithdrawConsent
        updateConsent={updateConsent}
        showModal={this.state.showModal}
        setShowModal={setShowModal}
      />
    ) : (
      <GiveConsent
        enableAgree={enableAgree}
        updateConsent={updateConsent}
        showModal={this.state.showModal}
        setShowModal={setShowModal}
      />
    );
  }
}

function GiveConsent({ enableAgree, updateConsent, showModal, setShowModal }) {
  return (
    <div className={styles.bottomContainer}>
      <button
        className="btn btn-primary"
        style={{ backgroundColor: '#4d4d4d69', borderColor: '#4d4d4d69' }}
        onClick={() => setShowModal(true)}
      >
        Disagree
      </button>

      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => updateConsent({ consent: false })}
        message="You must agree with this policy to use the app. Are you sure you wish to exit?"
        option="Exit"
      />
      {enableAgree ? (
        <button className="btn btn-primary" onClick={() => updateConsent({ consent: true })}>
          Agree
        </button>
      ) : (
        <button
          style={{ backgroundColor: '#4d4d4d69', borderColor: '#4d4d4d69' }}
          className="btn btn-primary"
        >
          Agree
        </button>
      )}
    </div>
  );
}

function WithdrawConsent({ updateConsent, showModal, setShowModal }) {
  return (
    <div className={styles.bottomContainer} style={{ justifyContent: 'center' }}>
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => updateConsent({ consent: false })}
        message="If you withdraw consent you won’t be able to use LiteFarm. Are you sure you wish to exit?"
        option="Withdraw"
      />
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Withdraw Consent
      </button>
    </div>
  );
}

export default ConsentFooter;
