import React from 'react';
import FarmMapIcon from '../../assets/images/farm-profile/farm-map.svg';
import FarmInfoIcon from '../../assets/images/farm-profile/farm-info.svg';
import PeopleIcon from '../../assets/images/farm-profile/people.svg'
import ListOption from "../Navigation/NavBar/ListOption";
import { useTranslation } from "react-i18next";


export default function PureMyFarmFloater({farmInfo, farmMap, people}) {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '-4px'}}>
      <ListOption clickFn={farmInfo} iconText={t('MY_FARM.FARM_INFO')} iconSrc={FarmInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={farmMap} iconText={t('MY_FARM.FARM_MAP')} iconSrc={FarmMapIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={people} iconText={t('MY_FARM.PEOPLE')} iconSrc={PeopleIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
    </div>
  )
}

