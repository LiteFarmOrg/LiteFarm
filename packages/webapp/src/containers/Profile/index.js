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
import Account from './Account';
import Farm from './Farm'
import People from './People'
import styles from './styles.scss'
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent }  from 'react-tabs-redux';
import { fetchFarmInfo } from '../actions';
import { farmSelector } from '../selector';

class Profile extends  Component{

  componentDidMount() {
    this.props.dispatch(fetchFarmInfo(localStorage.getItem('farm_id')));
  }

  render() {
    const { farm = { role: '' } } = this.props; // Needed when redux does not contain farm yet
    const { role } = farm;
    const currentUserRole = (role || '').toLowerCase();
    const isAdmin = currentUserRole === 'owner' || currentUserRole === 'manager';

    return <div className={styles.profileContainer}>
      <Tabs
        className={styles.tabs}
        renderActiveTabContentOnly={true}
        disableInlineStyles
      >
        <div className={styles.tabLinks}>
          <TabLink
            className={styles.tabLink}
            activeClassName={styles.selectedTabLink}
            to="account"
          >
            Account
          </TabLink>
          <TabLink
            className={styles.tabLink}
            activeClassName={styles.selectedTabLink}
            to="people"
          >
            People
          </TabLink>
          {
            isAdmin
              && (
                <TabLink
                  className={styles.tabLink}
                  activeClassName={styles.selectedTabLink}
                  to="farm"
                >
                  Farm
                </TabLink>
              )
          }
        </div>

        <div>
          <TabContent for="account"><Account /></TabContent>
          <TabContent for="people"><People isAdmin={isAdmin} /></TabContent>
          <TabContent for="farm"><Farm /></TabContent>
        </div>

      </Tabs>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    farm: farmSelector(state),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
