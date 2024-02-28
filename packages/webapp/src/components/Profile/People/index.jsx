import Input from '../../Form/Input';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import Table from '../../Table';
import { TableKind } from '../../Table/types';
import ProfileLayout from '../ProfileLayout';

export default function PurePeople({ users, history, isAdmin }) {
  const { t } = useTranslation(['translation', 'role']);
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
    const dropDownMap = {
      1: t('role:OWNER'),
      2: t('role:MANAGER'),
      3: t('role:WORKER'),
      4: t('role:WORKER_WITHOUT_ACCOUNT'),
      5: t('role:EXTENSION_OFFICER'),
    };
    const STATUS_TRANSLATIONS = {
      Active: t('STATUS.ACTIVE'),
      Inactive: t('STATUS.INACTIVE'),
      Invited: t('STATUS.INVITED'),
    };

    const getName = (user) => {
      const firstName = user.first_name;
      const lastName = user.last_name;
      return firstName.concat(' ', lastName);
    };

    const filteredUsers = users.filter((user) => {
      return getName(user)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^\p{L}0-9]/gu, '')
        .trim()
        .includes(
          searchString
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replace(/[^\p{L}0-9]/gu, '')
            .trim(),
        );
    });
    return filteredUsers.map((user) => ({
      name: getName(user),
      user_id: user.user_id,
      role: dropDownMap[user.role_id],
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
          history.push(`/user/${rowInfo.original.user_id}`);
        }
      },
      style: isClickable ? clickableStyle : normalTextStyle,
    };
  };
  return (
    <ProfileLayout
      onSubmit={() => history.push('/invite_user')}
      history={history}
      buttonGroup={
        isAdmin && (
          <Button data-cy="people-inviteUser" fullLength type={'submit'}>
            {t('PROFILE.PEOPLE.INVITE_USER')}
          </Button>
        )
      }
    >
      <Input
        value={searchString}
        onChange={onChange}
        isSearchBar
        placeholder={t('PROFILE.PEOPLE.SEARCH')}
      />
      <Table
        kind={TableKind.V1}
        data-cy="people-table"
        columns={summaryColumns}
        data={getFilteredUsers()}
        showPagination={true}
        pageSizeOptions={[5, 10, 20, 50]}
        defaultPageSize={5}
        className="-striped -highlight"
        getTdProps={onRowEdit}
        orderDesc={false}
      />
    </ProfileLayout>
  );
}
PurePeople.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object,
};
