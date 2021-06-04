import React from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import Button from '../../Form/Button';
import { connect } from 'react-redux';
import { cropsSelector } from '../../../containers/cropSlice';
import { DEC_RADIX } from '../../../containers/Field/constants';
import { convertFromMetric, convertToMetric, getUnit, roundToTwoDecimal } from '../../../util';
import DateContainer from '../../../components/Inputs/DateContainer';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import {
  createPrice,
  createYield,
  deleteManagementPlan,
  putManagementPlan,
} from '../../../containers/Crop/AddManagementPlan/ManagementPlanName/saga';

import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../Form/Input';
import { Dialog } from '@material-ui/core';
import newFieldStyles from '../NewManagementPlanModal/styles.module.scss';
import { Semibold, Underlined } from '../../Typography';
import styles from '../NewCropModal/styles.module.scss';
import ModalComponent from '../../Modals/ModalComponent/v2';

class EditManagementPlanModal extends React.Component {
  // props:

  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleManagementPlanPropertiesChange = this.handleManagementPlanPropertiesChange.bind(
      this,
    );
    this.handleValuesReset = this.handleValuesReset.bind(this);
    this.handleSubmitEditManagementPlan = this.handleSubmitEditManagementPlan.bind(this);

    this.state = {
      show: false,
      field: null,
      crops: [],
      isByArea: true,
      bed_config: null,
      managementPlan: this.props.cropBeingEdited,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      estimated_unit: getUnit(this.props.farm, 'kg', 'lb'),
      percentage: 0,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { estimated_unit, area_unit } = this.state;
    const managementPlan = this.state.managementPlan;
    const estimated_yield = roundToTwoDecimal(
      convertFromMetric(managementPlan.estimated_production, estimated_unit, 'kg') /
        convertFromMetric(managementPlan.area_used, area_unit, 'm2'),
    );
    const estimated_price =
      managementPlan.estimated_production <= 0
        ? 0
        : roundToTwoDecimal(
            managementPlan.estimated_revenue /
              convertFromMetric(managementPlan.estimated_production, estimated_unit, 'kg'),
          );
    const area_used = roundToTwoDecimal(
      convertFromMetric(managementPlan.area_used, area_unit, 'm2'),
    );
    this.setState({
      managementPlan: { ...managementPlan, estimated_price, estimated_yield, area_used },
      crops: this.props.crops,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.crops !== prevProps.crops) {
      this.setState({
        crops: this.props.crops,
      });
      this.handleValuesReset();
    }
  }

  handleClose = () => {
    this.setState({ show: false });
  };

  handleShow() {
    this.setState({ show: true });
    this.handleValuesReset();
  }

  // handleSaveCustomCrop = () => {
  //     this.props.dispatch(getCrops());
  // };

  handleSubmitEditManagementPlan = () => {
    const { bed_config, isByArea, estimated_unit, area_unit } = this.state;
    let editedManagementPlan = this.state.managementPlan;

    let { fieldArea } = this.props;
    if (this.state.area_unit === 'ft2') {
      fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    }

    if (
      moment(editedManagementPlan.harvest_date).isSameOrBefore(
        moment(editedManagementPlan.seed_date),
      )
    ) {
      toastr.error(this.props.t('message:EDIT_FIELD_CROP.ERROR.END_DATE_BEFORE'));
      return;
    }

    editedManagementPlan.area_used =
      editedManagementPlan.area_used > fieldArea ? fieldArea : editedManagementPlan.area_used;

    let estimatedProduction = isByArea
      ? editedManagementPlan.estimated_yield * editedManagementPlan.area_used
      : editedManagementPlan.estimated_yield * bed_config.bed_num;
    let estimatedRevenue = isByArea
      ? estimatedProduction * editedManagementPlan.estimated_price
      : bed_config.bed_num *
        editedManagementPlan.estimated_price *
        editedManagementPlan.estimated_yield;

    estimatedProduction = convertToMetric(estimatedProduction, estimated_unit, 'kg');

    let yieldData = {
      crop_id: editedManagementPlan.crop_id,
      'quantity_kg/m2': editedManagementPlan.estimated_yield,
      date: moment().format(),
    };

    let priceData = {
      crop_id: editedManagementPlan.crop_id,
      value: editedManagementPlan.estimated_price,
      date: moment().format(),
    };

    this.props.dispatch(createYield(yieldData));
    this.props.dispatch(createPrice(priceData));
    this.props.dispatch(
      putManagementPlan({
        management_plan_id: parseInt(this.props.cropBeingEdited.management_plan_id, DEC_RADIX),
        crop_id: parseInt(editedManagementPlan.crop_id, DEC_RADIX),
        location_id: this.props.cropBeingEdited.location.location_id,
        seed_date: editedManagementPlan.seed_date,
        harvest_date: editedManagementPlan.harvest_date,
        area_used: convertToMetric(editedManagementPlan.area_used, area_unit, 'm2'),
        estimated_production: estimatedProduction,
        variety: editedManagementPlan.variety || '',
        estimated_revenue: estimatedRevenue,
        is_by_bed: !isByArea,
        bed_config,
      }),
    );
    this.setState({ show: false });

    this.handleValuesReset();
  };

  handleManagementPlanPropertiesChange(event) {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    let managementPlan = this.state.managementPlan;
    let cropBeingEdited = {
      ...managementPlan,
      [event.target.id]: event.target.value,
    };
    this.setState({
      managementPlan: cropBeingEdited,
    });
  }

  handleValuesReset() {
    let managementPlan = JSON.parse(JSON.stringify(this.props.cropBeingEdited));
    let is_by_bed = managementPlan.is_by_bed;
    let bed_config = managementPlan.bed_config;
    const { estimated_unit, area_unit } = this.state;

    let percentage = 0;
    if (is_by_bed) {
      managementPlan.estimated_yield =
        bed_config.bed_num <= 0
          ? 0
          : roundToTwoDecimal(
              convertFromMetric(managementPlan.estimated_production, estimated_unit, 'kg') /
                bed_config.bed_num,
            );
      managementPlan.estimated_price =
        managementPlan.estimated_production <= 0
          ? 0
          : roundToTwoDecimal(
              managementPlan.estimated_revenue /
                bed_config.bed_num /
                managementPlan.estimated_yield,
            );
    } else {
      managementPlan.estimated_yield = roundToTwoDecimal(
        convertFromMetric(managementPlan.estimated_production, estimated_unit, 'kg') /
          convertFromMetric(managementPlan.area_used, area_unit, 'm2'),
      );

      managementPlan.estimated_price =
        managementPlan.estimated_production <= 0
          ? 0
          : roundToTwoDecimal(
              managementPlan.estimated_revenue /
                convertFromMetric(managementPlan.estimated_production, estimated_unit, 'kg'),
            );

      percentage = Number(((managementPlan.area_used / this.props.fieldArea) * 100).toFixed(2));
    }

    const area_used = roundToTwoDecimal(
      convertFromMetric(managementPlan.area_used, area_unit, 'm2'),
    );

    this.setState({
      managementPlan: { ...managementPlan, area_used },
      isByArea: !managementPlan.is_by_bed,
      bed_config: managementPlan.bed_config,
      percentage,
    });
  }

  onBedLenChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_length = e.target.value;
    let { bed_config, managementPlan } = this.state;
    managementPlan.area_used =
      Number(bed_length) * Number(bed_config.bed_width) * Number(bed_config.bed_num);
    bed_config.bed_length = bed_length;
    this.setState({
      managementPlan,
      bed_config,
    });
  };

  onBedWidthChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_width = e.target.value;
    let { bed_config, managementPlan } = this.state;
    managementPlan.area_used =
      Number(bed_config.bed_length) * Number(bed_width) * Number(bed_config.bed_num);
    bed_config.bed_width = bed_width;
    this.setState({
      managementPlan,
      bed_config,
    });
  };

  onBedNumChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_num = e.target.value;
    let { bed_config, managementPlan } = this.state;
    managementPlan.area_used =
      Number(bed_config.bed_length) * Number(bed_config.bed_width) * Number(bed_num);
    bed_config.bed_num = bed_num;
    this.setState({
      managementPlan,
      bed_config,
    });
  };

  handlePercentage = (e) => {
    let { managementPlan } = this.state;
    if (e.target.value < 0) {
      e.target.value = 0;
    }

    if (e.target.value > 100) {
      e.target.value = 100;
    }

    let { fieldArea } = this.props;

    fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    managementPlan.area_used = ((Number(e.target.value) / 100) * fieldArea).toFixed(0);
    this.setState({
      managementPlan,
      percentage: Number(e.target.value),
    });
  };

  onStartDateChange = (date) => {
    const currentCrop = this.state.managementPlan;
    currentCrop.seed_date = date.format('YYYY-MM-DD');
    this.setState({ managementPlan: currentCrop });
  };

  onEndDateChange = (date) => {
    const currentCrop = this.state.managementPlan;
    currentCrop.harvest_date = date.format('YYYY-MM-DD');
    this.setState({ managementPlan: currentCrop });
  };

  render() {
    const { isByArea, bed_config, showDeleteModal } = this.state;
    return (
      <>
        {React.cloneElement(this.props.children, { onClick: this.handleShow })}

        <Dialog
          PaperProps={{ className: newFieldStyles.dialogContainer }}
          fullWidth={true}
          maxWidth={'sm'}
          open={this.state.show}
          onClose={this.handleClose}
          scroll={'body'}
        >
          <Semibold>
            {this.props.t('common:EDIT')} -{' '}
            {this.props.t(`crop:${this.props.cropBeingEdited.crop_translation_key}`)},
            {this.props.t('FIELDS.EDIT_FIELD.VARIETY')}: {this.props.cropBeingEdited.variety}
          </Semibold>

          <div className={styles.container}>
            <FormGroup>
              <h4 style={{ textAlign: 'center' }}>
                {this.props.t('FIELDS.EDIT_FIELD.CROP.HOW_MUCH_FIELD')}
              </h4>
              {isByArea && (
                <div>
                  <FormGroup style={{ paddingBottom: '16px' }}>
                    <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.PERCENTAGE')}: </label>
                    <FormControl
                      data-test="percentage"
                      type="number"
                      min={0}
                      max={100}
                      onKeyDown={numberOnKeyDown}
                      placeholder={this.state.percentage}
                      onChange={(e) => this.handlePercentage(e)}
                    />
                  </FormGroup>
                  <FormGroup style={{ paddingBottom: '16px' }}>
                    <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED_HECTARE')}: </label>
                    <FormControl
                      type="number"
                      placeholder="0"
                      disabled={true}
                      onKeyDown={numberOnKeyDown}
                      value={(this.state.managementPlan.area_used / 10000).toFixed(2)}
                    />
                  </FormGroup>
                </div>
              )}
              {!isByArea && bed_config && (
                <div>
                  <FormGroup style={{ paddingBottom: '16px' }}>
                    <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.BED_LENGTH')} </label>
                    <FormControl
                      type="number"
                      value={bed_config.bed_length}
                      min={0}
                      onKeyDown={numberOnKeyDown}
                      onChange={(e) => this.onBedLenChange(e)}
                    />
                  </FormGroup>
                  <FormGroup style={{ paddingBottom: '16px' }}>
                    <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.BED_WIDTH')}: </label>
                    <FormControl
                      type="number"
                      onKeyDown={numberOnKeyDown}
                      value={bed_config.bed_width}
                      min={0}
                      onChange={(e) => this.onBedWidthChange(e)}
                    />
                  </FormGroup>
                  <FormGroup style={{ paddingBottom: '16px' }}>
                    <label>{this.props.t('FIELDS.EDIT_FIELD.CROP.NUMBER_OF_BEDS')}: </label>
                    <FormControl
                      type="number"
                      onKeyDown={numberOnKeyDown}
                      value={bed_config.bed_num}
                      min={0}
                      onChange={(e) => this.onBedNumChange(e)}
                    />
                  </FormGroup>
                </div>
              )}
              <FormGroup style={{ paddingBottom: '16px' }}>
                <label>
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.AREA_USED_IN')} {this.state.area_unit_label}
                  &sup2;:{' '}
                </label>
                <FormControl
                  type="number"
                  onKeyDown={numberOnKeyDown}
                  disabled={true}
                  value={this.state.managementPlan.area_used}
                />
              </FormGroup>
              <h4 style={{ textAlign: 'center' }}>
                {this.props.t('FIELDS.EDIT_FIELD.CROP.ENTER_START_FINISH')}
              </h4>
              <FormGroup controlId="seed_date">
                <DateContainer
                  date={moment(this.state.managementPlan.seed_date)}
                  onDateChange={this.onStartDateChange}
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CHOOSE_START_DATE')}
                />
              </FormGroup>
              <FormGroup controlId="harvest_date">
                <DateContainer
                  date={moment(this.state.managementPlan.harvest_date)}
                  onDateChange={this.onEndDateChange}
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CHOOSE_END_DATE')}
                />
              </FormGroup>
              <h4 style={{ textAlign: 'center' }}>
                {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_PRICE')} ($/
                {this.state.estimated_unit})
              </h4>
              <FormGroup controlId="estimated_price">
                <FormControl
                  type="number"
                  onKeyDown={numberOnKeyDown}
                  value={this.state.managementPlan.estimated_price}
                  onChange={(e) => this.handleManagementPlanPropertiesChange(e)}
                />
              </FormGroup>
              {isByArea && (
                <h4 style={{ textAlign: 'center' }}>
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_YIELD')} (
                  {this.state.estimated_unit}/{this.state.area_unit_label}&sup2;)
                </h4>
              )}
              {!isByArea && (
                <h4 style={{ textAlign: 'center' }}>
                  {this.props.t('FIELDS.EDIT_FIELD.CROP.EDIT_ESTIMATED_YIELD')} (
                  {this.state.estimated_unit}/{this.props.t('FIELDS.EDIT_FIELD.CROP.BED')})
                </h4>
              )}
              <FormGroup controlId="estimated_yield">
                <FormControl
                  type="number"
                  onKeyDown={numberOnKeyDown}
                  value={this.state.managementPlan.estimated_yield}
                  onChange={(e) => this.handleManagementPlanPropertiesChange(e)}
                />
              </FormGroup>
            </FormGroup>
          </div>

          <Underlined
            onClick={() => this.setState({ showDeleteModal: true })}
            style={{ padding: '20px 0 8px 0' }}
          >
            {this.props.t('FIELDS.EDIT_FIELD.CROP.REMOVE_CROP')}
          </Underlined>
          {showDeleteModal && (
            <ModalComponent
              dismissModal={() => this.setState({ showDeleteModal: false })}
              title={this.props.t('FIELDS.EDIT_FIELD.CROP.REMOVE_CROP')}
              contents={[this.props.t('FIELDS.EDIT_FIELD.CROP.DELETE_CONFIRMATION')]}
              buttonGroup={
                <>
                  <Button
                    style={{ marginRight: '8px' }}
                    sm
                    color={'secondary'}
                    onClick={() => this.setState({ showDeleteModal: false })}
                  >
                    {this.props.t('common:CANCEL')}
                  </Button>
                  <Button
                    sm
                    onClick={() => {
                      this.props.dispatch(
                        deleteManagementPlan(this.props.cropBeingEdited.management_plan_id),
                      );
                      this.setState({ showDeleteModal: false });
                    }}
                  >
                    {' '}
                    {this.props.t('common:DELETE')}
                  </Button>
                </>
              }
            />
          )}
          <div style={{ display: 'inline-flex', gap: ' 8px', marginTop: '16px', width: '100%' }}>
            <Button fullLength color={'secondary'} sm onClick={this.handleClose}>
              {this.props.t('common:CLOSE')}
            </Button>
            <Button
              sm
              fullLength
              onClick={() => {
                this.handleSubmitEditManagementPlan();
                this.props.handler();
              }}
            >
              {this.props.t('common:SAVE')}
            </Button>
          </div>
        </Dialog>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropsSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EditManagementPlanModal));
