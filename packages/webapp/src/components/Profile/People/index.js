import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';
import Table from '../../Table';
import styles from './styles.module.scss';

export default function PurePeople({ users, history, isAdmin }) {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const onChange = (e) => {
    setSearchString(e.target.value);
  };
  const summaryColumns = [
    {
      id: 'name',
      Header: t(`PROFILE.TABLE.HEADER_NAME`),
      accessor: 'name',
      minWidth: 70,
    },
    {
      id: 'email',
      Header: t(`PROFILE.TABLE.HEADER_EMAIL`),
      accessor: 'email',
      minWidth: 95,
      style: { whiteSpace: 'unset' },
    },
    {
      id: 'role',
      Header: t(`PROFILE.TABLE.HEADER_ROLE`),
      accessor: 'role',
      minWidth: 55,
    },
    {
      id: 'status',
      Header: t(`PROFILE.TABLE.HEADER_STATUS`),
      accessor: 'status',
      minWidth: 55,
    },
  ];

  const getFilteredUsers = () => {
    const ROLE_TRANSLATIONS = {
      Owner: t('role:OWNER'),
      'Extension Officer': t('role:EXTENSION_OFFICER'),
      Manager: t('role:MANAGER'),
      Worker: t('role:WORKER'),
      'Worker Without Account': t('role:WORKER_WITHOUT_ACCOUNT'),
    };
    const STATUS_TRANSLATIONS = {
      Active: t('STATUS.ACTIVE'),
      Inactive: t('STATUS.INACTIVE'),
      Invited: t('STATUS.INVITED'),
    };

    const getName = (user) => {
      const firstName = user.first_name.toLowerCase();
      const lastName = user.last_name.toLowerCase();
      return firstName.concat(' ', lastName);
    };

    const filteredUsers = users.filter((user) => {
      return getName(user).includes(searchString.trim().toLowerCase());
    });
    return filteredUsers.map((user) => ({
      name: getName(user),
      user_id: user.user_id,
      role: ROLE_TRANSLATIONS[user.role],
      email: user.email,
      status: STATUS_TRANSLATIONS[user.status],
      originalStatus: user.status,
    }));
  };
  const onRowEdit = (state, rowInfo, column, instance) => {
    const isClickable = rowInfo && isAdmin && column.id === 'name';
    const clickableStyle = {
      whiteSpace: 'unset',
      cursor: 'pointer',
      textDecoration: 'underline',
      color: '#0645AD',
    };
    const normalTextStyle = { whiteSpace: 'unset' };
    return {
      onClick: (e) => {
        if (isClickable) {
          history.push(`/update_user_permission/user/${rowInfo.original.user_id}`);
        }
      },
      style: isClickable ? clickableStyle : normalTextStyle,
    };
  };
  return (
    <div className={styles.container}>
      <Tabs value={0} aria-label="disabled tabs example">
        <Tab label="Account" />
        <Tab label="People" />
        <Tab label="Farm" />
      </Tabs>
      <Input
        value={searchString}
        onChange={onChange}
        isSearchBar
        placeholder={t('PROFILE.PEOPLE.SEARCH')}
      />
      <Table
        columns={summaryColumns}
        data={getFilteredUsers()}
        showPagination={true}
        pageSizeOptions={[5, 10, 20, 50]}
        defaultPageSize={5}
        className="-striped -highlight"
        getTdProps={onRowEdit}
      />
      <Button onClick={() => history.push('/invite_user')} fullLength>
        {t('PROFILE.PEOPLE.INVITE_USER')}
      </Button>
    </div>
  );
}
PurePeople.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object,
};
