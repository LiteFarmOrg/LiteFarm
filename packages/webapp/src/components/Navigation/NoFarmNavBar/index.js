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
import { connect } from 'react-redux';
import styles from './styles.scss';
import MiddleLogo from '../../../assets/images/middle_logo.svg';

const NoFarmNavBar = (props) => {
  return (
    <div className={styles.navBar}>
      <div className={styles.itemContainer}>
        <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => props.history.push('/')}/>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(null, mapDispatchToProps)(NoFarmNavBar);
