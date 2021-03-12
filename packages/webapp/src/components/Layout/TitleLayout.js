import Layout from './index';
import { Title } from '../Typography';
import React from 'react';
import BackArrow from '../../assets/images/miscs/arrow.svg';

function TitleLayout({ buttonGroup, title, onGoBack = null, children }) {
  return (
    <Layout buttonGroup={buttonGroup} classes={{ footer: { position: 'relative' } }}>
      <Title style={{ marginTop: '12px' }}>
        {onGoBack && (
          <img
            src={BackArrow}
            style={{ marginBottom: '-5px', cursor: 'pointer' }}
            onClick={onGoBack}
          />
        )}{' '}
        {title}
      </Title>
      <div style={{ order: '2', flexGrow: '9', marginTop: '15px' }}>{children}</div>
    </Layout>
  );
}

export default TitleLayout;
