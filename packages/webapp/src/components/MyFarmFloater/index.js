import React from 'react';
import FarmMapIcon from '../../assets/images/farm-profile/farm-map.svg';
import FarmInfoIcon from '../../assets/images/farm-profile/farm-info.svg';
import PeopleIcon from '../../assets/images/farm-profile/people.svg'
import ListOption from "../Navigation/NavBar/ListOption";
import { useTranslation } from "react-i18next";

import Floater from 'react-floater';

export default function PureMyFarmFloater({farmInfo, farmMap, people}) {
  const { t } = useTranslation();
export function PureMyFarmFloaterComponent({farmInfo, farmMap, people}) {
  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '-4px'}}>
      <ListOption clickFn={farmInfo} iconText={t('MY_FARM.FARM_INFO')} iconSrc={FarmInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={farmMap} iconText={t('MY_FARM.FARM_MAP')} iconSrc={FarmMapIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={people} iconText={t('MY_FARM.PEOPLE')} iconSrc={PeopleIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
    </div>
  )
}

export default function PureMyFarmFloater({children, openProfile, closeInteraction, history}) {

  const farmInfoClick = () => {
    history.push({
      pathname: '/Profile',
      state: "farm"
    })
    closeInteraction('myFarm');
  }
  const farmMapClick = () => {
    history.push('/Field')
    closeInteraction('myFarm');
  }
  const peopleClick = () => {
    history.push({
      pathname: '/Profile',
      state: "people"
    })
    closeInteraction('myFarm');
  }

  const Wrapper = (
    <PureMyFarmFloaterComponent farmInfo={farmInfoClick} farmMap={farmMapClick} people={peopleClick} />
  )
  return (
    <Floater component={Wrapper} placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  )
}

