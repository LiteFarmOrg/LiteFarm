import React from 'react';

import styles from './styles.module.scss';
import Footer from '../../Footer';
import PropTypes from 'prop-types';
import RouterTab from '../../RouterTab';
import { useTranslation } from 'react-i18next';

export default function ProfileLayout({ children, buttonGroup, onSubmit, history }) {
  const { t } = useTranslation();
  const onKeyDown = (e) => {
    if (document.activeElement.tagName !== 'BUTTON' && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.form} onKeyDown={onKeyDown}>
      <div className={styles.container}>
        <RouterTab
          history={history}
          tabs={[
            {
              label: t('PROFILE.ACCOUNT_TAB'),
              path: `/profile`,
            },
            {
              label: t('PROFILE.PEOPLE_TAB'),
              path: `/people`,
            },
            {
              label: t('PROFILE.FARM_TAB'),
              path: `/farm`,
            },
          ]}
        />
        {children}
      </div>
      <Footer>{buttonGroup}</Footer>
    </form>
  );
}
ProfileLayout.propTypes = {
  buttonGroup: PropTypes.node,
  children: PropTypes.node,
  onSubmit: PropTypes.func,
};
