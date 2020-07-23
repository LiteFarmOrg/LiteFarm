import { slide as Menu } from 'react-burger-menu';
import React from 'react';
// import logo from '../../../assets/images/logo2x.png';
import logo from '../../../../public/favicon-96x96.png';
import styles from './styles.scss';
import history from '../../../history';
import {connect} from 'react-redux';
import {userInfoSelector, farmSelector} from '../../../containers/selector'

class slideMenu extends React.Component {
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

    toggleSupport = () => {
      this.setState({supportOpen : !this.state.supportOpen})
  }
  toggleManage = () => {
      this.setState({manageOpen: !this.state.manageOpen}, () => console.log(this.state.manageOpen))
  }

  render () {
    const {isAuthenticated, logout, users, farm} = this.props;

    return (
      <div>
      {isAuthenticated() && users && farm && farm.has_consent &&
      <Menu isOpen={this.state.menuOpen}
            width={ 180 }
            onStateChange={(state) => this.handleStateChange(state)}
            className={styles["menu-body"]}>
        <div className={styles["top-nav-bar"]}>
          <img src={logo} alt={"logo"}/>
        </div>
      {
      <a id="manage" className="menu-item" onClick={() => this.toggleManage()}><span>Manage</span></a>
      }
      {this.state.manageOpen &&
      <div className={styles["sub-menu"]}>
      {
          (Number(farm.role_id) === 1 || Number(farm.role_id) === 2)
       &&
      <a id="field" className="menu-item" onClick={() => this.handleClick("/Field")}><span>Fields</span></a>
    }
      <a id="crops" className="menu-item" onClick={() => console.log("clicked crops")}><span>Crops</span></a>
      <a id="log" className="menu-item" onClick={() => this.handleClick("/Log")}><span>Logs</span></a>
      <a id="tasks" className="menu-item" ><span>Tasks</span></a>
      <a id="inventory" className="menu-item" ><span>Inventory</span></a>
      <a id="profile" className="menu-item" onClick={() => this.handleClick("/Profile")}><span>Users</span></a>
     </div>
          }
      {
      (Number(farm.role_id) === 1) &&
      <a id="finances" className="menu-item" onClick={() => this.handleClick("/Finances")}><span>Finances</span></a>
  }
        <a id="shift" className="menu-item" onClick={() => this.handleClick("/Shift")}><span>Shift</span></a>

        {
          (Number(farm.role_id) === 1 || Number(farm.role_id) === 2) &&
          <a id="insights" className="menu-item" onClick={() => this.handleClick("/Insights")}><span>Insights</span></a>
        }
      {
        <a id="support" className="menu-item" onClick={() => this.toggleSupport()} ><span>Support</span></a>
      }
      { this.state.supportOpen &&
         <div className={styles["sub-menu"]}>
          {
          (Number(farm.role_id) === 1 || Number(farm.role_id) === 2) &&
          <a id="demo" className="menu-item" onClick={() => this.handleClick("/Intro")}><span>Demos</span></a>
      }
      <a id="contact" className="menu-item" onClick={() => this.handleClick("/Contact")}><span>Contact Us</span></a>
          <a id="terms" className="menu-item" onClick={() => this.handleClick("/Consent")}><span>Terms</span></a>
          </div>
       }
      <a onClick={logout} id="logout" className="menu-item"><span>Log Out</span></a>
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

export default connect(mapStateToProps, mapDispatchToProps)(slideMenu);

