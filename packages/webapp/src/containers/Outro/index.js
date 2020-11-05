import React  from "react";
import { connect } from 'react-redux';
import { farmSelector } from '../selector';
import history from '../../history';
import { finishOnboarding } from './actions';
import { showSpotlight } from "../actions";
import PureOutroSplash from "../../components/Outro";

function Outro({ farm, dispatch }) {

  const redirectFinish = () => {
    dispatch(finishOnboarding())
    dispatch(showSpotlight(true))
    history.push('/home')
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
