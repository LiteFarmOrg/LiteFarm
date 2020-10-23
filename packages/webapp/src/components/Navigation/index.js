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
import { useMediaQuery } from 'react-responsive';
import styles from './styles.scss';
import SlideMenu from './slideMenu';
import SmallerLogo from '../../assets/images/smaller_logo.svg';
import SmallLogo from '../../assets/images/small_logo.svg';
import MiddleLogo from '../../assets/images/middle_logo.svg';
import MyFarmIcon from '../../assets/images/my-farm.svg';
import NotifIcon from '../../assets/images/notif.svg';
import HelpIcon from '../../assets/images/help.svg';

import {farmSelector} from '../../containers/selector'

// class NavBar extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       profilePic: null
//     };
//   }

//   goTo(route) {
//     this.props.history.replace(`/${route}`);
//   }

//   componentDidMount(){
//     let p = localStorage.getItem('profile_picture');
//     if(p === null){
//       setTimeout(function() { //Start the timer
//         p = localStorage.getItem('profile_picture');
//         if(p){
//           this.setState({profilePic: p});
//         }
//       }.bind(this), 1500);
//     }else{
//       this.setState({profilePic: p});
//     }
//   }

//   logout() {
//     this.props.auth.logout();
//   }

//   render() {
//     const { isAuthenticated } = this.props.auth;
//     let {profilePic} = this.state;
//     const { history, farm } = this.props;
//     const isMiddleLogo = history.location
//       && history.location.pathname.substring(0, 8) === '/sign_up';

//     if (isAuthenticated() && farm && farm.has_consent)
//       return (
//         <div>
//           <Navbar className={styles.navBar} collapseOnSelect={true} fixedTop={true}>
//             {/* Set maxWidth to match with .navBar in styles */}
//             <Navbar.Header style={{ textAlign: 'center', maxWidth: '1024px' }}>
//               <div className={styles.navBarContainer}>
//                 <Navbar.Brand className={styles.title}>
//                   {
//                     isMiddleLogo
//                       ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => this.props.history.push('/')}/>
//                       : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => this.props.history.push('/')} />
//                   }
//                 </Navbar.Brand>
//                 {/* <div className={styles.actionItemContainer}>
//                   <input type="image" src={MyFarmIcon} className={styles.actionItem}/>
//                   <input type="image" src={NotifIcon} className={styles.actionItem}/>
//                   <input type="image" src={HelpIcon} className={styles.actionItem}/>
//                 </div> */}
//               </div>
//             </Navbar.Header>
//           </Navbar>
//           <SlideMenu right isAuthenticated={isAuthenticated} logout={this.logout.bind(this)} />
//           <div className={styles.actionItemContainer}>
//             <input type="image" src={MyFarmIcon} className={styles.actionItem}/>
//             <input type="image" src={NotifIcon} className={styles.actionItem}/>
//             <input type="image" src={HelpIcon} className={styles.actionItem}/>
//           </div>
//         </div>
//       );

//     return (
//       <div>
//         <Navbar className={styles.navBar} collapseOnSelect={true} fixedTop={true}>
//           {/* Set maxWidth to match with .navBar in styles */}
//           <Navbar.Header style={{ textAlign: 'center', maxWidth: '1024px' }}>
//             <div className={styles.navBarContainer}>
//               <Navbar.Brand className={styles.title}>
//                 {
//                   isMiddleLogo
//                     ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => this.props.history.push('/')}/>
//                     : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => this.props.history.push('/')} />
//                 }
//               </Navbar.Brand>
//             </div>
//           </Navbar.Header>
//         </Navbar>
//       </div>
//     );
//   }
// }

const NavBar = (props) => {
  const { auth, history, farm } = props;
  const { isAuthenticated } = auth;
  const isMiddleLogo = history.location
    && history.location.pathname.substring(0, 8) === '/sign_up';
  const isSmallScreen = useMediaQuery({query: '(max-width: 800px)'});
  const Logo = isMiddleLogo ? (<img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => props.history.push('/')}/>)
    : isSmallScreen ? (<img src={SmallerLogo} alt="Logo" className={styles.smallLogo} onClick={() => props.history.push('/')} />)
      : (<img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => props.history.push('/')} />)

  const logout = () => {
    auth.logout();
  };

  const goTo = (route) => {
    props.history.replace(`/${route}`);
  }

  if (isAuthenticated() && farm && farm.has_consent)
    return (
      <div className={styles.navBar}>
        {/* <Navbar className={styles.navBar} collapseOnSelect={true} fixed={"top"}> */}
          {/* Set maxWidth to match with .navBar in styles */}
          {/*<Navbar.Header style={{ textAlign: 'center', maxWidth: '1024px' }}>*/}
            {/* <div className={styles.navBarContainer}> */}
              {/* <Navbar.Brand className={styles.title}> */}
                {/* {
                  isMiddleLogo
                    ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => props.history.push('/')}/>
                    : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => props.history.push('/')} />
                } */}
              {/* </Navbar.Brand> */}
              {/* <div className={styles.actionItemContainer}>
                <input type="image" src={MyFarmIcon} className={styles.actionItem}/>
                <input type="image" src={NotifIcon} className={styles.actionItem}/>
                <input type="image" src={HelpIcon} className={styles.actionItem}/>
              </div> */}
            {/* </div> */}
          {/*</Navbar.Header>*/}
        {/* </Navbar> */}
        {/* <div className={styles.title}>
          {
            isMiddleLogo
            ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => props.history.push('/')}/>
            : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => props.history.push('/')} />
          }
        </div> */}
        <div className={styles.actionItemContainer}>
          <input type="image" src={MyFarmIcon} className={styles.actionItem}/>
          <input type="image" src={NotifIcon} className={styles.actionItem}/>
          <input type="image" src={HelpIcon} className={styles.actionItem}/>
        </div>
        <div className={styles.itemContainer}>
          {Logo}
        </div>
        <SlideMenu right logout={logout} />
      </div>
    );

  return (
    // <div className={styles.navBar}>
    //   <div className={styles.title}>
    //     {
    //       isMiddleLogo
    //         ? <img src={MiddleLogo} alt="Logo" className={styles.middleLogo} onClick={() => props.history.push('/')}/>
    //         : <img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => props.history.push('/')} />
    //     }
    //   </div>
    // </div>
    <div className={styles.navBar}>
      <div className={styles.itemContainer}>
        <Logo />
      </div>
    </div>
  );
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

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
