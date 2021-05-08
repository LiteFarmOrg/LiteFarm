import React from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import { Underlined } from '../Typography';
import { useTranslation } from 'react-i18next';
import Filter from '../Filter';
import Button from '../Form/Button';

const PureFilterPage = ({ title, filters, onApply, filterRef }) => {
  const { t } = useTranslation();

  return (
    <Layout
      buttonGroup={
        <Button disabled={false} onClick={onApply} fullLength>
          {t('common:APPLY')}
        </Button>
      }
    >
      <PageTitle title={title} onGoBack={() => console.log('close that filter page though')} />

      <div style={{ margin: '24px 0' }}>
        <Underlined style={{ color: '#AA5F04' }} onClick={() => console.log('clear filter')}>
          {t('FILTER.CLEAR_ALL_FILTERS')}
        </Underlined>
      </div>

      {filters.map((filter) => {
        if (filter.options.length !== 0)
          return (
            <Filter
              subject={filter.subject}
              items={filter.options}
              filterKey={filter.filterKey}
              style={{ marginBottom: '24px' }}
              filterRef={filterRef}
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
