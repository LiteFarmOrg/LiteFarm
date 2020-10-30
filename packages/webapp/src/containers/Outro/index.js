import React  from "react";
import { connect } from 'react-redux';
import { farmSelector } from '../selector';
import history from '../../history';
import { finishOnboarding } from './actions';
import PureOutroSplash from "../../components/Outro";

function Outro({ farm, dispatch }) {

  const redirectFinish = () => {
    if (farm) {
      // TODO replace with Brandon's Splotlight component
      dispatch(finishOnboarding())
      history.push('/home')
    }
    // TODO: add else case wih Jimmy's organic farm
  }


  return (
    <PureOutroSplash redirectFinish={redirectFinish} />
  )

}

const mapStateToProps = (state) => {
  return {
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Outro);
