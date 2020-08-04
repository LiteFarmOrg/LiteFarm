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

import React, { Component } from 'react';
import styles from '../styles.scss';
import handStandPng from '../../../assets/images/miscs/hand_stand.png';
import errorPng from '../../../assets/images/miscs/error.svg';
import errorPngAlt from '../../../assets/images/miscs/error.png';
import Auth from '../../../Auth/Auth';

const auth = new Auth();

class InvalidToke extends Component {
  render() {
    return (
      <div className={styles.backdrop}>
        <div className={styles.home}>
          <div className={styles.messageContainer}>
              {/*<div style={background}>apsionaiong</div>*/}
            <img src={handStandPng} alt="" className={styles.handStand} />
            <div className={styles.redBox}>
              <div className={styles.redBoxHat}><img src={errorPng} alt={errorPngAlt} className={styles.errorImg} /></div>
              <div className={styles.errorMsg}>

                <h2>Oops!</h2>

                <h3>That didn't work.</h3>

                <h3>Please, sign up.</h3>
              </div>
            </div>

            <div className={styles.signUpButtonToken} onClick={()=>auth.login()}>Sign Up</div>
          </div>

        </div>
      </div>

    );
  }
}

export default InvalidToke;
