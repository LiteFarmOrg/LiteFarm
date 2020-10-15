import { slide as Menu } from 'react-burger-menu';
import React from 'react';
// import logo from '../../../assets/images/logo2x.png';
import logo from '../../../assets/images/nav-logo.svg';
import vectorUp from '../../../assets/images/vector-up.svg';
import vectorDown from '../../../assets/images/vector-down.svg';
import styles from './styles.scss';
import history from '../../../history';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {userInfoSelector, farmSelector} from '../../../containers/selector'
const noConsentCheckRoutes = ['/consent','/farm_selection', '/intro']

class SlideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      supportOpen: false,
      manageOpen: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
  }
  //TODO: Switch to useEffect
  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.farm && !nextProps.farm.has_consent && !noConsentCheckRoutes.includes(this.props.location.pathname) ){
      history.push('/consent', { role_id: nextProps.farm.role_id });
    }
  }


  toggleSupport = () => {
    this.setState({supportOpen : !this.state.supportOpen})
  }
  toggleManage = () => {
    this.setState({manageOpen: !this.state.manageOpen})
  }

  render () {
    const {isAuthenticated, logout, users, farm} = this.props;

    return (
      <div>
        {isAuthenticated() && users && farm && farm.has_consent &&
        <Menu isOpen={this.state.menuOpen}
              width={ 204 }
              onStateChange={(state) => this.handleStateChange(state)}
              className={styles["menu-body"]}>
          <div className={styles["top-nav-bar"]}>
            <img src={logo} alt={"logo"} onClick={() => this.handleClick("/")}/>
          </div>
          {
            <a id="manage" className="menu-item" onClick={() => this.toggleManage()}><span>Manage </span><img src={this.state.manageOpen ? vectorUp : vectorDown} alt={"logo"}/></a>
          }
          {this.state.manageOpen &&
          <div className={styles["sub-menu"]} style={{'display':'grid'}}>
            {
              (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 5)
              &&
              <a id="field" className="menu-item" onClick={() => this.handleClick("/Field")}><span>Fields</span></a>
            }
            {/* <a id="crops" className="menu-item" ><span>Crops</span></a> */}
            <a id="log" className="menu-item" onClick={() => this.handleClick("/Log")}><span>Logs</span></a>
            <a id="shift" className="menu-item" onClick={() => this.handleClick("/Shift")}><span>Shifts</span></a>

            {/* <a id="tasks" className="menu-item" ><span>Tasks</span></a> */}
            {/* <a id="inventory" className="menu-item" ><span>Inventory</span></a> */}
            <a id="profile" className="menu-item" onClick={() => this.handleClick("/Profile")}><span>Users</span></a>
          </div>
          }
          {
            (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 5) &&
            <a id="finances" className="menu-item" onClick={() => this.handleClick("/Finances")}><span>Finances</span></a>
          }

          {
            (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 3 || Number(farm.role_id) === 5) &&
            <a id="insights" className="menu-item" onClick={() => this.handleClick("/Insights")}><span>Insights</span></a>
          }
          {
            <a id="support" className="menu-item" onClick={() => this.toggleSupport()}><span>Support</span><img src={this.state.supportOpen ? vectorUp : vectorDown} alt={"logo"}/></a>
          }
          { this.state.supportOpen &&
          <div className={styles["sub-menu"]} style={{'display':'grid'}}>
            {
              (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 3 || Number(farm.role_id) === 5) &&
              <a id="demo" className="menu-item" onClick={() => this.handleClick("/intro")}><span>Demos</span></a>
            }
            {/*<a id="contact" className="menu-item" onClick={() => this.handleClick("/contact")}><span>Contact us</span></a>*/}
            <a id="terms" className="menu-item" onClick={() => this.handleClick("/consent")}><span>Privacy Policy</span></a>
          </div>
          }
          <a onClick={logout} id="logout" className="menu-item"><span>Log out</span></a>
        </Menu>
        }
      </div>
    );
  }




  handleStateChange(state) {
    this.setState({menuOpen: state.isOpen})
  }
  handleClick(link) {
    history.push(link);
    this.setState({menuOpen: !this.state.menuOpen})
  }
}
const slideMenuWithRoute = withRouter(props => <SlideMenu {...props}/>);

const mapStateToProps = (state) => {
  return {
    users: userInfoSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(slideMenuWithRoute);

