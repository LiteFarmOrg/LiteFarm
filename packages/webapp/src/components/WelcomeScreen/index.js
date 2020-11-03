import Layout from "../Layout";
import Button from "../Form/Button";
import Svg from "../Svg";
import signup2 from "../../assets/images/signUp/signUp2.svg";
import React from "react";
import PropTypes from "prop-types";

export default function PureWelcomeScreen({ onClick }) {
  return <Layout isSVG buttonGroup={<Button onClick={onClick} fullLength>Let's get started</Button>}>
    <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>
  </Layout>
}

PureWelcomeScreen.prototype = {
  onClick: PropTypes.func,
}
