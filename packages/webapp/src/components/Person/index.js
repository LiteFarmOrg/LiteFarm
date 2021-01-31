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
import styles from './styles.scss';
import { Button } from 'react-bootstrap';
class Person extends Component {
  render() {
    let user = this.props.user;
    let isPseudo = this.props.isPseudo;
    return (
      <div className={styles.userContainer}>
        <img src={user.profile_picture} alt="" />
        <div className={styles.info}>
          <div>
            {user.first_name} {user.last_name}
          </div>
          {!isPseudo && <div>{user.email}</div>}
        </div>
        <Button className={styles['edit-button']} onClick={this.props.click}>
          Edit
        </Button>
      </div>
    );
  }
}
export default Person;
