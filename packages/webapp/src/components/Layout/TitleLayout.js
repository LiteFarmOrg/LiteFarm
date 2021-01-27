import Layout from './index';
import Button from '../Form/Button';
import { Title } from '../Typography';
import { IoIosArrowBack } from 'react-icons/io';
import React from 'react';

function TitleLayout({ buttonGroup, title, onGoBack = null, children }) {
  return (
    <Layout buttonGroup={buttonGroup}>
      <div
        style={{
          order: '1',
          flexGrow: '0',
          flexShrink: '9',
          borderBottomStyle: 'solid',
          maxBlockSize: '40px',
          borderBottomColor: 'var(--grey400)',
          borderBottomWidth: '5px',
        }}
      >
        <div style={{ width: '100%' }}>
          <Title>
            {onGoBack && (
              <IoIosArrowBack
                style={{ marginBottom: '2px', cursor: 'pointer' }}
                onClick={onGoBack}
              />
            )}{' '}
            {title}
          </Title>
        </div>
      </div>
      <div style={{ order: '2', flexGrow: '9', marginTop: '15px' }}>{children}</div>
      <div style={{ order: '3', flexGrow: '0', flexShrink: '9', minBlockSize: '0.3rem' }}></div>
    </Layout>
  );
}

export default TitleLayout;
