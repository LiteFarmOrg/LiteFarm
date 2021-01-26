import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { actions, Form } from 'react-redux-form';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import { getUnit } from '../../../util';
import Unit from '../../../components/Inputs/Unit';
import { withTranslation } from 'react-i18next';
import { getFieldCrops } from '../../saga';
import { formDataSelector, selectedUseTypeSelector, formValueSelector } from '../selectors';
import { toastr } from 'react-redux-toastr';
import { addLog } from '../Utility/actions';
import { setSelectedUseTypes } from '../actions';

class HarvestAllocation extends Component {
  constructor(props) {
    super(props);
    const { farm, dispatch } = this.props;
    this.props.dispatch(actions.reset('logReducer.forms.harvestAllocation'));

    this.state = {
      date: moment(),
      quantity_unit: getUnit(farm, 'kg', 'lb'),
    };
    this.setDate = this.setDate.bind(this);
    dispatch(getFieldCrops());
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(val) {
    this.props.useType.map((obj) => {
      if (obj.harvest_use_type_name in val) {
        obj.quantity = val[obj.harvest_use_type_name];
      }
    });
    let sum = 0;
    Object.keys(val).forEach(function (key) {
      sum += parseInt(val[key]);
    });

    if (sum != this.props.formData.quantity_kg) {
      toastr.error('Total does not equal the amount to allocate');
    } else {
      console.log(this.props.useType);
      this.props.dispatch(addLog(this.props.formValue));
    }
  }

  render() {
    return (
      <div className="page-container">
        <div className={styles.textContainer}>
          <PageTitle
            backUrl="/harvest_use_type"
            title={this.props.t('LOG_HARVEST.HARVEST_ALLOCATION_TITLE')}
            isHarvestLogStep={true}
          />
        </div>
        <h4>{this.props.t('LOG_HARVEST.HARVEST_ALLOCATION_SUBTITLE')}</h4>
        <p>{this.props.t('LOG_HARVEST.HARVEST_ALLOCATION_SUBTITLE_TWO')}</p>
        <div style={{ color: '#085D50', fontWeight: 'bold' }}>
          <p>{this.props.formData.quantity_kg + this.state.quantity_unit}</p>
        </div>

        <Form model="logReducer.forms" onSubmit={(val) => this.handleSubmit(val.harvestAllocation)}>
          {this.props.useType.map((type, index) => {
            const typeName = type.harvest_use_type_name;
            let model = '.harvestAllocation.' + type.harvest_use_type_name;
            return (
              <div style={index === 0 ? { paddingTop: '5px' } : { paddingTop: '35px' }}>
                <Unit
                  model={model}
                  title={typeName}
                  type={this.state.quantity_unit}
                  validate
                  isHarvestAllocation={true}
                />
              </div>
            );
          })}

          {/* <LogFooter backButtonName={"Cancel"} forwardButtonName={"Next"} /> */}

          <div className={styles.bottomContainer}>
            <div
              className={styles.backButton}
              onClick={() => this.props.history.push('/harvest_use_type')}
            >
              {this.props.t('common:BACK')}
            </div>
            <button
              className="btn btn-primary-round"
              //   onClick={() => {
              //     console.log("use types")
              //     console.log(this.props.useType)
              //     // history.push('/harvest_allocation');
              //   }}
              disabled={this.state.disabled}
            >
              {this.props.t('common:NEXT')}
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    formData: formDataSelector(state),
    useType: selectedUseTypeSelector(state),
    formValue: formValueSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(HarvestAllocation));
