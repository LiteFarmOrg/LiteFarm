import React  from "react";
import { connect } from 'react-redux';
import history from '../../history';
import { finishOnboarding } from './actions';
import PureOutroSplash from "../../components/Outro";

function Outro({ farm, dispatch }) {

  const redirectFinish = () => {
    dispatch(finishOnboarding())
    history.push('/home')
  }

  const onGoBack = () => {

  }


  return (
    <PureOutroSplash redirectFinish={redirectFinish} onGoBack={onGoBack} />
  )

}

const mapStateToProps = (state) => {
  return {
    farm: state.baseReducer.farm,
  }
};

const mapDispatchToProps = (dispatch) => {
  return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Outro);
