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
import { connect } from 'react-redux';
import { Navbar } from 'react-bootstrap';
import styles from './styles.scss';
import SlideMenu from './slideMenu';
import SmallLogo from '../../assets/images/small_logo.svg';
import MiddleLogo from '../../assets/images/middle_logo.svg';

class NavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profilePic: null
    };
  }

  goTo(route) {
    this.props.history.replace(`/${route}`);
  }

  componentDidMount(){
    let p = localStorage.getItem('profile_picture');
    if(p === null){
      setTimeout(function() { //Start the timer
        p = localStorage.getItem('profile_picture');
        if(p){
          this.setState({profilePic: p});
        }
      }.bind(this), 1500);
    }else{
      this.setState({profilePic: p});
    }
  }

  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    let {profilePic} = this.state;
    const { history } = this.props;
    const isMiddleLogo = history.location
      && history.location.pathname.substring(0, 8) === '/sign_up';

    return (
      <div>
        <Navbar className={styles.navBar} collapseOnSelect={true} fixedTop={true}>
          {/* Set maxWidth to match with .navBar in styles */}
          <Navbar.Header style={{ textAlign: 'center', maxWidth: '1024px' }}>
            <div className={styles.navBarContainer}>
              <Navbar.Brand className={styles.title}>
                {
                  isMiddleLogo
                    ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => this.props.history.push('/')}/>
                    : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => this.props.history.push('/')} />
                }
              </Navbar.Brand>
              {
                isAuthenticated() && profilePic && <img
                  alt=""
                  src={profilePic}
                  width="30"
                  height="30"
                  className={styles.profilePic}
                />
              }
            </div>
          </Navbar.Header>
        </Navbar>
        <SlideMenu right isAuthenticated={isAuthenticated} logout={this.logout.bind(this)} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(null, mapDispatchToProps)(NavBar);
