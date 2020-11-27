import React from 'react';
import FarmMapIcon from '../../assets/images/farm-profile/farm-map.svg';
import FarmInfoIcon from '../../assets/images/farm-profile/farm-info.svg';
import PeopleIcon from '../../assets/images/farm-profile/people.svg'
import ListOption from "../Navigation/NavBar/ListOption";
import Floater from 'react-floater';

export function PureMyFarmFloaterComponent({farmInfo, farmMap, people}) {
  return (
    <div style={{ maxWidth: '148px', minWidth:'138px',backgroundColor: 'white', borderRadius:'4px', marginRight: '-4px'}}>
      <ListOption clickFn={farmInfo} iconText={'Farm info'} iconSrc={FarmInfoIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={farmMap} iconText={'Farm map'} iconSrc={FarmMapIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
      <ListOption clickFn={people} iconText={'People'} iconSrc={PeopleIcon} customParagraphStyle={{paddingTop: '0.5rem'}}/>
    </div>
  )
}

export default function PureMyFarmFloater({children, openProfile}) {

  const farmInfoClick = () => {
  }
  const farmMapClick = () => {
  }
  const peopleClick = () => {
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

