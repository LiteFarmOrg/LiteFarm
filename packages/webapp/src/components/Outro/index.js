import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import { ReactComponent } from '../../assets/images/outro/outro.svg';
import PageTitle from '../PageTitle/v2';

export default function PureJoinFarmSuccessScreen({ onContinue, onGoBack }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Layout
      buttonGroup={
        <Button onClick={onContinue} fullLength>
          {t('common:FINISH')}
        </Button>
      }
    >
      <PageTitle onGoBack={onGoBack} title={''} />
      <div
        style={{
          alignItems: 'center',
          textAlign: 'center',
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: '27.3vh',
            margin: '1vh 0 5vh 0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ReactComponent style={{ height: '100%' }} />
        </div>
        <Main style={{ marginBottom: 0, maxWidth: '360px', width: 'calc(100% - 48px)' }}>
          {t('OUTRO')}
        </Main>
      </div>
    </Layout>
  );
}

PureJoinFarmSuccessScreen.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  showSpotLight: PropTypes.bool,
};
