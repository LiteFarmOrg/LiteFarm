import Layout from './index';
import { Title } from '../Typography';
import React from 'react';
import BackArrow from '../../assets/images/miscs/arrow.svg';
import { useTranslation } from 'react-i18next';

function TitleLayout({ buttonGroup, title, onGoBack = null, children, onCancel }) {
  const { t } = useTranslation();
  return (
    <Layout buttonGroup={buttonGroup} classes={{ footer: { position: 'relative' } }}>
      <Title style={{ marginTop: '12px', position: 'relative' }}>
        {onGoBack && (
          <img
            src={BackArrow}
            style={{ marginBottom: '-5px', cursor: 'pointer' }}
            onClick={onGoBack}
          />
        )}{' '}
        {title}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              position: 'absolute',
              right: 0,
              color: '#028577',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              backgroundColor: 'transparent',
              paddingTop: '8px',
            }}
          >
            {t('common:CANCEL')}
          </button>
        )}
      </Title>
      <div style={{ order: '2', flexGrow: '9', marginTop: '15px' }}>{children}</div>
    </Layout>
  );
}

export default TitleLayout;
