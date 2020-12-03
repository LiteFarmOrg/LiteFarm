import Layout from '../Layout';
import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { Title, Underlined } from '../Typography';
import ChooseFarmMenuItem from './ChooseFarmMenu/ChooseFarmMenuItem';
import Input from '../Form/Input';
import { useTranslation } from "react-i18next";


export default function PureChooseFarmScreen({
  farms = [], onGoBack,
  onProceed, onSelectFarm, onCreateFarm, isOnBoarding, onFilterChange, isSearchable, disabled, title='Choose your farm'
}) {
  const { t } = useTranslation();

  return <Layout hasWhiteBackground buttonGroup={
    <>
      {!isOnBoarding && <Button onClick={onGoBack} color={'secondary'} fullLength>{t('common:BACK')}</Button>}
      <Button onClick={onProceed} fullLength disabled={disabled}>{t('common:PROCEED')}</Button>
    </>
  }>
    <Title style={{ marginBottom: '16px' }}>{title}</Title>
    <div style={{
      marginBottom: '24px',
      width: 'fit-content',
      fontSize: '16px',
      color: 'var(--iconActive)',
      lineHeight: '16px',
      cursor: 'pointer'
    }}
         onClick={onCreateFarm}>+ <Underlined>{t('CHOOSE_FARM.ADD_NEW')}</Underlined></div>
    {isSearchable &&
    <Input style={{ marginBottom: '16px' }} placeholder={t('CHOOSE_FARM.INPUT_PLACEHOLDER')} isSearchBar={true} onChange={onFilterChange}/>}
    {farms.map((farm) => {
      return <ChooseFarmMenuItem style={{ marginBottom: '16px' }} farmName={farm.farmName} address={farm.address}
                                 color={farm.color}
                                 onClick={farm.color === 'disabled' ? undefined : () => onSelectFarm(farm.farm_id)}
                                 ownerName={farm.ownerName}/>
    })}
  </Layout>
}

PureChooseFarmScreen.prototype = {
  farms: PropTypes.arrayOf(PropTypes.exact({
    farmName: PropTypes.string,
    address: PropTypes.arrayOf(PropTypes.string),
    farm_id: PropTypes.string,
    coordinate: PropTypes.exact({ lon: PropTypes.number, lat: PropTypes.number }),
    ownerName: PropTypes.string,
  })),
  onGoBack: PropTypes.func,
  onProceed: PropTypes.func,
  onSelectFarm: PropTypes.func,
  onCreateFarm: PropTypes.func,
  isOnBoarding: PropTypes.bool,
  isSearchable: PropTypes.bool,
  onFilterChange: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
}
