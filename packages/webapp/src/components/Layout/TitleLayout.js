import Layout from './index';
import { Title } from '../Typography';
import { IoIosArrowBack } from 'react-icons/io';
import React from 'react';

function TitleLayout({ buttonGroup, title, onGoBack = null, onSubmit, children }) {
  return (
    <Layout buttonGroup={buttonGroup} classes={{ footer: { position: 'relative' } }}>
      <Title style={{ marginTop: '12px' }}>
        {onGoBack && (
          <IoIosArrowBack style={{ marginBottom: '2px', cursor: 'pointer' }} onClick={onGoBack} />
        )}{' '}
        {title}
      </Title>
      <div style={{ order: '2', flexGrow: '9', marginTop: '15px' }}>{children}</div>
    </Layout>
  );
}

export default TitleLayout;
