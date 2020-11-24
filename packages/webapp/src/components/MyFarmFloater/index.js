import React from 'react';
import FarmMapIcon from '../../assets/images/farm-profile/farm-map.svg';
import FarmInfoIcon from '../../assets/images/farm-profile/farm-info.svg';
import SettingsIcon from '../../assets/images/farm-profile/settings.svg';
import PeopleIcon from '../../assets/images/farm-profile/people.svg'
import ListOption from "../Navigation/NavBar/ListOption";

export default function PureMyFarmFloater({farmInfo, farmMap, people, settings}) {
  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '-4px'}}>
      <ListOption clickFn={farmInfo} iconText={'Farm info'} iconSrc={FarmInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={farmMap} iconText={'Farm map'} iconSrc={FarmMapIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={people} iconText={'People'} iconSrc={PeopleIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={settings} iconText={'Settings'} iconSrc={SettingsIcon} customParagraphStyle={{paddingBottom: '0.5rem'}}/>
    </div>
  )
}

