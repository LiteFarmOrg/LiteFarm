/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import defaultStyles from '../styles.scss';
import { actions, Control, Form } from 'react-redux-form';
import { Alert, Button } from 'react-bootstrap';
import { getFarmSchedule, sendFarmDataRequst } from './actions';
import { farmDataSelector } from './selector';
import Popup from 'reactjs-popup';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { putFarm } from '../../saga';

class Farm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      request_pending_text:
        'Farm Data requested by an admin, the process can take up to 20 minutes, please wait before sending another request.',
      request_text: 'Get Farm Raw Data',
      enableRequest: true,
      showData: false,
    };
    this.sendRequest = this.sendRequest.bind(this);
  }

  componentDidMount() {
    const { farm } = this.props;
    this.props.dispatch(getFarmSchedule());
    if (farm) {
      this.props.dispatch(actions.change('profileForms.farmInfo.currency', farm.units.currency));
      this.props.dispatch(
        actions.change('profileForms.farmInfo.farm_phone_number', farm.farm_phone_number || ''),
      );
    }
  }

  handleSubmit(updated_farm, farm) {
    const newFarm = {};
    newFarm.farm_name = updated_farm.farm_name;
    newFarm.address = updated_farm.address;
    newFarm.grid_points = updated_farm.gridPoints;
    newFarm.farm_phone_number = updated_farm.farm_phone_number;
    newFarm.units = {
      measurement: updated_farm.unit,
      currency: farm.units.currency,
    };
    newFarm.farm_id = farm.farm_id;
    newFarm.user_id = farm.user_id;

    this.props.dispatch(putFarm(newFarm));
  }

  sendRequest() {
    this.setState({
      enableRequest: false,
    });
    this.props.dispatch(sendFarmDataRequst());
  }

  closeDataModal = () => {
    this.setState({ showData: false });
  };
  openDataModal = () => {
    this.setState({ showData: true });
  };

  render() {
    const { farm, schedule } = this.props;
    const { request_text, request_pending_text, enableRequest } = this.state;
    return (
      <div>
        <div className={styles.formContainer}>
          {farm && farm.farm_name && (
            <Form
              model="profileForms"
              onSubmit={(val) => {
                this.handleSubmit(val.farmInfo, farm);
              }}
            >
              <div className={styles.labelContainer}>
                <label>{this.props.t('PROFILE.FARM.FARM_NAME')}</label>
                <Control.text
                  model=".farmInfo.farm_name"
                  validators={{
                    required: (val) => val.length,
                    // length: (val) => val.length > 2,
                  }}
                  defaultValue={farm.farm_name}
                />
              </div>

              {farm.farm_phone_number && (
                <div className={styles.phoneContainer}>
                  <label>{this.props.t('PROFILE.FARM.PHONE_NUMBER')}</label>
                  <Control.text
                    model=".farmInfo.farm_phone_number"
                    defaultValue={farm.farm_phone_number}
                  />
                </div>
              )}
              {!farm.farm_phone_number && (
                <div className={styles.phoneContainer}>
                  <label>{this.props.t('PROFILE.FARM.PHONE_NUMBER')}</label>
                  <Control.text model=".farmInfo.farm_phone_number" />
                </div>
              )}
              <div className={styles.labelContainer}>
                <label>{this.props.t('PROFILE.FARM.ADDRESS')}</label>
                <Control model=".farmInfo.address" value={farm.address} disabled />
              </div>
              <div className={styles.selectContainer}>
                <label>{this.props.t('PROFILE.FARM.UNITS')}</label>
                <Control.select
                  model=".farmInfo.unit"
                  defaultValue={farm.units.measurement}
                  style={{ marginLeft: '8px' }}
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </Control.select>
              </div>
              <div className={styles.selectContainer}>
                <label>{this.props.t('PROFILE.FARM.CURRENCY')}</label>
                <p style={{ marginLeft: '8px' }}>{farm.units.currency}</p>
              </div>
              {/* <div className={styles.greenTextButton} onClick={() => this.openDataModal()}>
                {request_text}
              </div> */}
              <div className={defaultStyles.bottomContainer}>
                <div className={defaultStyles.buttonContainer}>
                  <Button type="submit" variant="primary">
                    {this.props.t('common:SAVE')}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </div>

        <Popup
          open={this.state.showData}
          closeOnDocumentClick
          onClose={this.closeDataModal}
          contentStyle={{
            display: 'flex',
            width: '100%',
            minHeight: '30vh',
            padding: '0 5%',
            flexDirection: 'column',
          }}
          overlayStyle={{ zIndex: '1060', minHeight: '100vh', top: 'auto' }}
        >
          <div>
            <h3>Data Request</h3>
          </div>
          <hr
            style={{
              border: '0.5px solid black',
              height: '0px',
              marginLeft: '-6%',
            }}
          />
          <p>{this.props.t('PROFILE.FARM.REQUEST_DATA')}</p>

          {enableRequest &&
            schedule &&
            schedule.farm_data_schedule &&
            schedule.farm_data_schedule.length === 0 && (
              <div className={styles.requestContainer}>
                <Button onClick={() => this.sendRequest()}>
                  {this.props.t('PROFILE.FARM.MAKE_REQUEST')}
                </Button>
              </div>
            )}
          {(enableRequest === false ||
            (schedule &&
              schedule.farm_data_schedule &&
              schedule.farm_data_schedule.length > 0)) && (
            <div>
              <Alert variant="warning">{request_pending_text}</Alert>
            </div>
          )}
        </Popup>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state) => {
  return {
    farm: userFarmSelector(state),
    schedule: farmDataSelector(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Farm));
