import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { Title, Underlined, Main } from '../Typography';
// import ChooseFarmMenuItem from './ChooseFarmMenu/ChooseFarmMenuItem';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Card from '../Card';

export default function PureInviteSignUp({ onProceed, disabled }) {
  const { t } = useTranslation();

  return (
    <Layout
      hasWhiteBackground
      buttonGroup={
        <>
          {/* {!isOnBoarding && (
            <Button onClick={onGoBack} color={'secondary'} fullLength>
              {t('common:BACK')}
            </Button>
          )} */}
          <Button onClick={onProceed} fullLength disabled={disabled}>
            {t('common:PROCEED')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('INVITE_SIGN_UP.TITLE')}</Title>
      <Main style={{ marginBottom: '24px' }}>{t('INVITE_SIGN_UP.PARAGRAPH')}</Main>
      {/* <div
        style={{
          marginBottom: '24px',
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
        onClick={onCreateFarm}
      >
        + <Underlined>{t('CHOOSE_FARM.ADD_NEW')}</Underlined>
      </div> */}
      {/* {isSearchable && (
        <Input
          style={{ marginBottom: '16px' }}
          placeholder={t('CHOOSE_FARM.INPUT_PLACEHOLDER')}
          isSearchBar={true}
          onChange={onFilterChange}
        />
      )}
      {farms.map((farm) => {
        return (
          <ChooseFarmMenuItem
            style={{ marginBottom: '16px' }}
            farmName={farm.farmName}
            address={farm.address}
            color={farm.color}
            onClick={farm.color === 'disabled' ? undefined : () => onSelectFarm(farm.farm_id)}
            ownerName={farm.ownerName}
          />
        );
      })} */}
      <Card
        color={'secondary'}
        // onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '63px',
          justifyContent: 'space-between',
          // cursor: color === 'secondary' ? 'pointer' : 'default',
          // ...style,
        }}
        // {...props}
      >
        <div>{t('INVITE_SIGN_UP.WITH_GOOGLE')}</div>
        {/* <div className={styles.leftColumn}>
          <h5 className={clsx(styles.farmName, color === 'active' && styles.active)}>{farmName}</h5>
          {ownerName && <p className={clsx(styles.address, styles[color])}>{ownerName}</p>}
        </div>
        <div className={styles.rightColumn}>
          {address.map((row) => (
            <p className={clsx(styles.address, styles[color])}>{row}</p>
          ))}
        </div> */}
      </Card>
      <Card
        color={'secondary'}
        // onClick={color === 'disabled' ? undefined : () => onSelectLiteFarm()}
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '63px',
          justifyContent: 'space-between',
          // cursor: color === 'secondary' ? 'pointer' : 'default',
          // ...style,
        }}
        // {...props}
      >
        <div>{t('INVITE_SIGN_UP.WITH_LITEFARM')}</div>
      </Card>
    </Layout>
  );
}

PureInviteSignUp.prototype = {
  onProceed: PropTypes.func,
  // onSelectFarm: PropTypes.func,
  disabled: PropTypes.bool,
};
