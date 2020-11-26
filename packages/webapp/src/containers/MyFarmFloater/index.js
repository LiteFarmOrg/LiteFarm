import Floater from "react-floater";
import React from "react";
import PureMyFarmFloater from "../../components/MyFarmFloater";
import history from '../../history';
export default function MyFarmFloater({closeInteraction, children, openProfile}) {

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
    <PureMyFarmFloater farmInfo={farmInfoClick} farmMap={farmMapClick} people={peopleClick} />
  )
  return (
    <Floater component={Wrapper} placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  )
}


