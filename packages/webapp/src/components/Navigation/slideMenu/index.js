import { slide as Menu } from 'react-burger-menu';
import React from 'react';
import logo from '../../../assets/images/logo2x.png';
import styles from './styles.scss';
import history from '../../../history';
import {connect} from 'react-redux';
import {userInfoSelector, farmSelector} from '../../../containers/selector'

class slideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
  }

  render () {
    const {isAuthenticated, logout, users, farm} = this.props;

    return (
      <div>
      {isAuthenticated() && users && farm && farm.has_consent &&
      <Menu isOpen={this.state.menuOpen}
            width={ 180 }
            onStateChange={(state) => this.handleStateChange(state)}>
        <div className={styles["top-nav-bar"]}>
          <img width="60%" height="60%" src={logo} alt={"logo"}/>
        </div>
        <a id="home" className="menu-item" onClick={() => this.handleClick("/")}><span>Home</span></a>
        <a id="profile" className="menu-item" onClick={() => this.handleClick("/Profile")}><span>Profile</span></a>
        {
          (Number(farm.role_id) === 1 || Number(farm.role_id) === 2) &&
          <a id="field" className="menu-item" onClick={() => this.handleClick("/Field")}><span>Fields</span></a>
        }
        <a id="log" className="menu-item" onClick={() => this.handleClick("/Log")}><span>Log</span></a>
        <a id="shift" className="menu-item" onClick={() => this.handleClick("/Shift")}><span>Shift</span></a>
        {
          (Number(farm.role_id) === 1) &&
          <a id="finances" className="menu-item" onClick={() => this.handleClick("/Finances")}><span>Finances</span></a>
        }
        {
          (Number(farm.role_id) === 1 || Number(farm.role_id) === 2) &&
          <a id="insights" className="menu-item" onClick={() => this.handleClick("/Insights")}><span>Insights</span></a>
        }
        <a onClick={logout} id="logout" className="menu-item"><span>Log Out</span></a>
        <div className={styles["hyper-link"]}>
          {
            (Number(farm.role_id) === 1 || Number(farm.role_id) === 2) &&
            <a id="demo" onClick={() => this.handleClick("/Intro")}>Demos</a>
          }
          <a id="contact" onClick={() => this.handleClick("/Contact")}>Contact Us</a>
          <a id="terms" onClick={() => this.handleClick("/Consent")}>Terms</a>

        </div>

      </Menu>}
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

