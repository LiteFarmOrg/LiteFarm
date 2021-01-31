import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main, Title } from '../Typography';
import { ReactComponent } from '../../assets/images/outro/outro.svg';

export default function PureJoinFarmSuccessScreen({ onClick, farm_name, showSpotLight }) {
  const { t } = useTranslation();
  return (
    <Layout
      buttonGroup={
        <Button onClick={onClick} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      classes={{
        container: {
          alignItems: 'center',
          textAlign: 'center',
        },
      }}
    >
      <div
        style={{
          height: '27.3vh',
          margin: '8vh 0 5vh 0',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ReactComponent style={{ height: '100%' }} />
      </div>
      <Title style={{ marginBottom: 0 }}>{t('JOIN_FARM_SUCCESS.SUCCESSFULLY_JOINED')}</Title>
      <Title style={{ marginBottom: '5vh', fontWeight: 600 }}> {farm_name}</Title>
      {showSpotLight && (
        <Main style={{ width: '65%' }}>{t('JOIN_FARM_SUCCESS.IMPORTANT_THINGS')}</Main>
      )}
    </Layout>
  );
}

PureJoinFarmSuccessScreen.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
