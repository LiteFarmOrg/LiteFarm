/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import defaultStyles from '../styles.module.scss';
import { actions, Control, Form } from 'react-redux-form';
import { Button } from 'react-bootstrap';
import { getFarmSchedule, sendFarmDataRequst } from './actions';
import { farmDataSelector } from './selector';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { putFarm } from '../../saga';
import { integerOnKeyDown } from '../../../components/Form/Input';

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
    const { role_id } = this.props.farm;
    const OWNER = 1;
    const MANAGER = 2;
    const OFFICER = 5;
    const disabled = ![OWNER, MANAGER, OFFICER].includes(role_id);
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
                  disabled={disabled}
                />
              </div>

              {farm.farm_phone_number && (
                <div className={styles.phoneContainer}>
                  <label>{this.props.t('PROFILE.FARM.PHONE_NUMBER')}</label>
                  <Control.text
                    type={'number'}
                    onKeyDown={integerOnKeyDown}
                    model=".farmInfo.farm_phone_number"
                    defaultValue={farm.farm_phone_number}
                    disabled={disabled}
                  />
                </div>
              )}
              {!farm.farm_phone_number && (
                <div className={styles.phoneContainer}>
                  <label>{this.props.t('PROFILE.FARM.PHONE_NUMBER')}</label>
                  <Control.text
                    model=".farmInfo.farm_phone_number"
                    type={'number'}
                    onKeyDown={integerOnKeyDown}
                    disabled={disabled}
                  />
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
                  disabled={disabled}
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </Control.select>
              </div>
              <div className={styles.selectContainer}>
                <label>{this.props.t('PROFILE.FARM.CURRENCY')}</label>
                <p style={{ marginLeft: '8px' }}>{farm.units.currency}</p>
              </div>

              {!disabled && (
                <div className={defaultStyles.bottomContainer}>
                  <div className={defaultStyles.buttonContainer}>
                    <Button type="submit" variant="primary">
                      {this.props.t('common:SAVE')}
                    </Button>
                  </div>
                </div>
              )}
            </Form>
          )}
        </div>
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
