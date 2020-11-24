import Floater from "react-floater";
import React from "react";
import PureMyFarmFloater from "../../components/MyFarmFloater";
import history from '../../history';
export default function MyFarmFloater({children, openProfile}) {

  const farmInfoClick = () => {
  }
  const farmMapClick = () => {
}
  const peopleClick = () => {
  }

  const settingsClick = () => {
}

  const Wrapper = (
    <PureMyFarmFloater farmInfo={farmInfoClick} farmMap={farmMapClick} people={peopleClick} settings={settingsClick}/>
  )
  return (
    <Floater component={Wrapper} placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  )
}
