import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import { Underlined } from '../Typography';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import Filter from '../Filter';
import Button from '../Form/Button';

const PureFilterPage = ({ title, filters }) => {
  const { t } = useTranslation();
  return (
    <Layout
      buttonGroup={
        <Button type={'submit'} disabled={false} fullLength>
          {t('common:APPLY')}
        </Button>
      }
    >
      <PageTitle title={title} onGoBack={() => console.log('close that filter page though')} />

      <div style={{ margin: '24px 0' }} onClick={() => console.log('clear filter')}>
        <Underlined style={{ color: '#AA5F04' }}>{t('FILTER.CLEAR_ALL_FILTERS')}</Underlined>
      </div>

      {filters.map((filter) => {
        if (filter.options.length !== 0)
          return (
            <Filter
              subject={filter.subject}
              items={filter.options}
              style={{ marginBottom: '24px' }}
            />
          );
      })}
    </Layout>
  );
};

PureFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default PureFilterPage;
