import React, {Component} from 'react';
import {connect} from 'react-redux';
import {pricesDistanceSelector} from "../../../containers/Insights/selectors";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import styles from "../../PageTitle/styles.scss";



class PriceDistanceComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      distance: this.props.pricesDistance,
    };
  }
  componentDidMount() {

  }

  render() {
    return (
    <div>
      <a onClick={() => this.props.handleOpenCollapse()} className={styles.buttonContainer}>
      <Glyphicon glyph={"cog"}/>
      </a>
    </div>)
  }

}
const mapStateToProps = (state) => {
  return {
    pricesDistance: pricesDistanceSelector(state)
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps) (PriceDistanceComponent);