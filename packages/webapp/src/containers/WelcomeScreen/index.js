import history from "../../history";
import React from "react";
import PureWelcomeScreen from "../../components/WelcomeScreen";

export default function WelcomeScreen() {
  const onClick = () => {
    history.push('./add_farm_3');
  }
  return <PureWelcomeScreen onClick={onClick}/>
}
