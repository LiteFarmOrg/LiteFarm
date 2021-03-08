import Layout from './index';
import { Title } from '../Typography';
import { IoIosArrowBack } from 'react-icons/io';
import React from 'react';

function TitleLayout({ buttonGroup, title, onGoBack = null, children }) {
  return (
    <Layout buttonGroup={buttonGroup} classes={{ footer: { position: 'absolute' } }}>
      <Title style={{ marginTop: '12px' }}>
        {onGoBack && (
          <IoIosArrowBack style={{ cursor: 'pointer', marginBottom: -3 }} onClick={onGoBack} />
        )}{' '}
        {title}
      </Title>
      <div style={{ order: '2', flexGrow: '9', marginTop: '15px' }}>{children}</div>
    </Layout>
  );
}

export default TitleLayout;
