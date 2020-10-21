/* eslint-disable */
import React, {Component} from "react";
import {farmSelector as farmInfoSelector} from '../../selector';
import {connect} from 'react-redux';
import {updateFarm} from '../../actions';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import {Control, Form, actions} from 'react-redux-form';
import {Button, Alert} from 'react-bootstrap';
import {sendFarmDataRequst, getFarmSchedule} from './actions'
import FarmAddress from '../../../components/AddFarm/FarmAddress';
import {farmDataSelector} from './selector';
import Popup from "reactjs-popup";


class Farm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      request_pending_text: 'Farm Data requested by an admin, the process can take up to 20 minutes, please wait before sending another request.',
      request_text: 'Get Farm Raw Data',
      enableRequest: true,
      showData: false,
    };
    this.sendRequest = this.sendRequest.bind(this);
  }

  componentDidMount(){
    const {farm} = this.props;
    this.props.dispatch(getFarmSchedule());
    if(farm){
      this.props.dispatch(actions.change('profileForms.farmInfo.currency', farm.units.currency));
    }
  }

  handleSubmit(updated_farm, farm) {
    farm.farm_name = updated_farm.farm_name;
    farm.address = updated_farm.address;
    farm.grid_points = updated_farm.gridPoints;
    farm.phone_number = {
      number: updated_farm.phone_number,
      country: updated_farm.phone_country
    };

    farm.units = {
      measurement: updated_farm.unit,
      currency: farm.units.currency,
    };

    this.props.dispatch(updateFarm(farm));
  }

  sendRequest(){
    this.setState({
      enableRequest: false,
    });
    this.props.dispatch(sendFarmDataRequst());
  };

  closeDataModal = () => {
    this.setState({ showData: false });
  };
  openDataModal = () => {
    this.setState({ showData: true });
  };

  render() {
    const {farm, schedule} = this.props;
    const {request_text, request_pending_text, enableRequest} = this.state;
    return (
      <div>
        <div className={styles.formContainer}>
          {farm && farm.farm_name && (
            <Form model="profileForms" onSubmit={(val) => this.handleSubmit(val.farmInfo, farm)}>
              <div className={styles.labelContainer}>
                <label>Farm<br/>Name</label>
                <Control.text model=".farmInfo.farm_name"
                              validators={{required: (val) => val.length, length: (val) => val.length > 2}}
                              defaultValue={farm.farm_name}/>
              </div>

              {farm.phone_number && (
                <div className={styles.phoneContainer}>
                  <label>Phone<br/>Number</label>
                  <Control.text model=".farmInfo.phone_number" defaultValue={farm.phone_number.number}/>
                </div>
              )}
              {!farm.phone_number && (
                <div className={styles.phoneContainer}>
                  <label>Phone<br/>Number</label>
                  <Control.text model=".farmInfo.phone_number"/>
                </div>
              )}
              <div className={styles.labelContainer}>
                <label>Address</label>
                <Control model=".farmInfo.address" value={farm.address} disabled/>
              </div>
              <div className={styles.selectContainer}>
                <label>Units</label>
                <Control.select model=".farmInfo.unit" defaultValue={farm.units.measurement} style={{marginLeft: '8px'}}>
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </Control.select>
              </div>
              <div className={styles.selectContainer}>
                <label>Currency</label>
                <p style={{marginLeft: '8px'}}>{farm.units.currency}</p>
              </div>
              {/* <div className={styles.greenTextButton} onClick={() => this.openDataModal()}>
                {request_text}
              </div> */}
              <div className={defaultStyles.bottomContainer}>
                <div className={defaultStyles.buttonContainer}>
                  <Button type='submit' variant='primary'>Save</Button>
                </div>
              </div>
            </Form>
          )}
        </div>


        <Popup
          open={this.state.showData}
          closeOnDocumentClick
          onClose={this.closeDataModal}
          contentStyle={{display:'flex', width:'100%', minHeight:'30vh', padding:'0 5%', flexDirection: 'column'}}
          overlayStyle={{zIndex: '1060', minHeight:'100vh', top: 'auto'}}
        >
          <div>
            <h3>Data Request</h3>
          </div>
          <hr style={{border: '0.5px solid black', height: '0px', marginLeft: '-6%'}} />
          <p>
            You can request a data download and we will send your farm's data to your email, in the form of csv.
          </p>

            {
              enableRequest && schedule && schedule.farm_data_schedule && schedule.farm_data_schedule.length === 0 &&
              <div className={styles.requestContainer}>
              <Button onClick={()=>this.sendRequest()} >
                Make a request
              </Button>
              </div>
            }
            {
              (enableRequest === false || (schedule && schedule.farm_data_schedule && schedule.farm_data_schedule.length > 0)) &&
              <div>
                <Alert variant="warning">
                  {request_pending_text}
                </Alert>
              </div>
            }
        </Popup>

      </div>
    )

  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

const mapStateToProps = (state) => {
  return {
    farm: farmInfoSelector(state),
    schedule: farmDataSelector(state),
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(Farm);
