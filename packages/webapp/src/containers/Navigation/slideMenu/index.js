import { slide as Menu } from 'react-burger-menu';
import React, { useState } from 'react';
import logo from '../../../assets/images/navbar/nav-logo.svg';
import vectorUp from '../../../assets/images/navbar/vector-up.svg';
import vectorDown from '../../../assets/images/navbar/vector-down.svg';
import styles from './styles.scss';
import history from '../../../history';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { userFarmSelector } from '../../userFarmSlice';
import { useTranslation } from 'react-i18next';

function SlideMenu() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const farm = useSelector(userFarmSelector);
  const toggleSupport = () => {
    setSupportOpen(!supportOpen);
  };
  const toggleManage = () => {
    setManageOpen(!manageOpen);
  };

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };
  const handleClick = (link) => {
    history.push(link);
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <Menu
        isOpen={menuOpen}
        width={204}
        onStateChange={(state) => handleStateChange(state)}
        className={styles['menu-body']}
      >
        <div className={styles['top-nav-bar']}>
          <img src={logo} alt={'logo'} onClick={() => handleClick('/')} />
        </div>
        {
          <a id="manage" className="menu-item" onClick={() => toggleManage()}>
            <span>{t('SLIDE_MENU.MANAGE')}</span>
            <img src={manageOpen ? vectorUp : vectorDown} alt={'logo'} />
          </a>
        }
        {manageOpen && (
          <div className={styles['sub-menu']} style={{ display: 'grid' }}>
            <a id="field" className="menu-item" onClick={() => handleClick('/Field')}>
              <span>{t('SLIDE_MENU.FIELDS')}</span>
            </a>

            <a id="log" className="menu-item" onClick={() => handleClick('/Log')}>
              <span>{t('SLIDE_MENU.LOGS')}</span>
            </a>
            <a id="shift" className="menu-item" onClick={() => handleClick('/Shift')}>
              <span>{t('SLIDE_MENU.SHIFTS')}</span>
            </a>

            {/* <a id="tasks" className="menu-item" ><span>Tasks</span></a> */}
            {/* <a id="inventory" className="menu-item" ><span>Inventory</span></a> */}
            <a id="profile" className="menu-item" onClick={() => handleClick('/Profile')}>
              <span>{t('SLIDE_MENU.USERS')}</span>
            </a>
          </div>
        )}
        {(Number(farm.role_id) === 1 ||
          Number(farm.role_id) === 2 ||
          Number(farm.role_id) === 5) && (
          <a id="finances" className="menu-item" onClick={() => handleClick('/Finances')}>
            <span>{t('SLIDE_MENU.FINANCES')}</span>
          </a>
        )}

        {(Number(farm.role_id) === 1 ||
          Number(farm.role_id) === 2 ||
          Number(farm.role_id) === 3 ||
          Number(farm.role_id) === 5) && (
          <a id="insights" className="menu-item" onClick={() => handleClick('/Insights')}>
            <span>{t('SLIDE_MENU.INSIGHTS')}</span>
          </a>
        )}
        {
          <a id="support" className="menu-item" onClick={() => toggleSupport()}>
            <span>{t('SLIDE_MENU.SUPPORT')}</span>
            <img src={supportOpen ? vectorUp : vectorDown} alt={'logo'} />
          </a>
        }
        {supportOpen && (
          <div className={styles['sub-menu']} style={{ display: 'grid' }}>
            {(Number(farm.role_id) === 1 ||
              Number(farm.role_id) === 2 ||
              Number(farm.role_id) === 3 ||
              Number(farm.role_id) === 5) && (
              <a id="demo" className="menu-item" onClick={() => handleClick('/intro')}>
                <span>{t('SLIDE_MENU.DEMOS')}</span>
              </a>
            )}
            {/*<a id="contact" className="menu-item" onClick={() => handleClick("/contact")}><span>Contact us</span></a>*/}
            {/*<a id="terms" className="menu-item"*/}
            {/*   onClick={() => handleClick("/consent")}><span>Privacy Policy</span></a>*/}
          </div>
        )}
      </Menu>
    </div>
  );
}
const slideMenuWithRoute = withRouter((props) => <SlideMenu {...props} />);

export default slideMenuWithRoute;
