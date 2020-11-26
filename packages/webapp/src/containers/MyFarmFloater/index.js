import Floater from "react-floater";
import React from "react";
import PureMyFarmFloater from "../../components/MyFarmFloater";
import history from '../../history';
export default function MyFarmFloater({closeInteraction, children, openProfile}) {

  const farmInfoClick = () => {
  }
  const farmMapClick = () => {
    history.push('/Field')
    closeInteraction('myFarm');
}
  const peopleClick = () => {
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


