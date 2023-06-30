/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, Component, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import history from '../../history';
// images
import soil_om from '../../assets/images/insights/soil_om.svg';
import labour_happiness from '../../assets/images/insights/labour_happiness.svg';
import biodiversity from '../../assets/images/insights/biodiversity.svg';
import prices from '../../assets/images/insights/prices.svg';

// actions
import { getLabourHappinessData, getPricesWithDistanceData, getSoilOMData } from './actions';
// selectors
import {
  labourHappinessSelector,
  pricesDistanceSelector,
  pricesSelector,
  soilOMSelector,
} from './selectors';

import InfoBoxComponent from '../../components/InfoBoxComponent';
import { BsChevronRight } from 'react-icons/bs';
import { userFarmSelector } from '../userFarmSlice';
import { Semibold, Text, Title } from '../../components/Typography';

const Insights = () => {
  const farm = useSelector(userFarmSelector);
  const pricesDistance = useSelector(pricesDistanceSelector);
  const soilOMData = useSelector(soilOMSelector);
  const labourHappinessData = useSelector(labourHappinessSelector);
  const biodiversityData = null;
  const pricesData = useSelector(pricesSelector);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const items = [
    {
      label: t('INSIGHTS.SOIL_OM.TITLE'),
      image: soil_om,
      route: 'SoilOM',
      data_point: 'SoilOM',
    },
    {
      label: t('INSIGHTS.LABOUR_HAPPINESS.TITLE'),
      image: labour_happiness,
      route: 'LabourHappiness',
      data_point: 'LabourHappiness',
    },
    {
      label: t('INSIGHTS.BIODIVERSITY.TITLE'),
      image: biodiversity,
      route: 'Biodiversity',
      data_point: 'Biodiversity',
    },
    {
      label: t('INSIGHTS.PRICES.TITLE'),
      image: prices,
      route: 'Prices',
      data_point: 'Prices',
    },
  ];

  useEffect(() => {
    dispatch(getSoilOMData());
    dispatch(getLabourHappinessData());
    dispatch(getPricesWithDistanceData(farm.grid_points, pricesDistance));
  }, []);

  const handleClick = (route) => {
    history.push(`/Insights/${route}`);
  };

  const renderItem = (item, index, currentData) => (
    <div key={index} className={`insightItem item-${index} ${styles.insightItem}`}>
      <div
        className={`itemButton item-${index} ${styles.itemButton}`}
        onClick={() => handleClick(item.route)}
      >
        <img
          className={`itemIcon item-${index} ${styles.itemIcon}`}
          src={item.image}
          alt={item.label}
        />
        <div className={`itemText item-${index} ${styles.itemText}`}>
          <Semibold>{item.label}</Semibold>
          {item.label === t('INSIGHTS.BIODIVERSITY.TITLE') ? (
            <Text>{currentData}</Text>
          ) : (
            <Text>{`${t('INSIGHTS.CURRENT')}: ${currentData ?? 0}`}</Text>
          )}
        </div>
        <BsChevronRight className={styles.itemArrow} />
      </div>
      <hr className={styles.defaultLine} />
    </div>
  );

  const insightData = useMemo(() => {
    const insightData = {};
    insightData['SoilOM'] = (soilOMData.preview ?? '0') + '%';
    insightData['LabourHappiness'] = labourHappinessData.preview
      ? labourHappinessData.preview + '/5'
      : t('INSIGHTS.UNAVAILABLE');
    insightData['Biodiversity'] = t('INSIGHTS.CLICK_TO_CALCULATE');
    insightData['prices'] = pricesData.preview
      ? t('INSIGHTS.PRICES.PERCENT_OF_MARKET', { percentage: pricesData.preview })
      : t('INSIGHTS.UNAVAILABLE');
    return insightData;
  }, [soilOMData, labourHappinessData, biodiversityData, pricesData]);

  const renderedItems = useMemo(() => {
    return (
      insightData &&
      items.map((item, index) => {
        return renderItem(item, index, insightData[item.data_point]);
      })
    );
  }, [insightData]);

  return (
    <div className={styles.insightContainer}>
      <div>
        <div className={styles.leftText}>
          <Title>{t('INSIGHTS.TITLE')}</Title>
        </div>
        <div className={styles.rightText}>
          <InfoBoxComponent
            customStyle={{ fontSize: '20px' }}
            title={t('INSIGHTS.TITLE')}
            body={<div>{t('INSIGHTS.INFO')}</div>}
          />
        </div>
      </div>
      <hr style={{ marginBottom: '0px' }} />
      <hr className={styles.defaultLineWithNoMarginTop} />
      {renderedItems}
    </div>
  );
};

export default Insights;
