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
  putFieldCrop,
} from '../../../containers/LocationDetails/LocationFieldCrop/saga';

import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../Form/Input';
import { Dialog } from '@material-ui/core';
import newFieldStyles from '../NewFieldCropModal/styles.module.scss';
import { Semibold } from '../../Typography';
import styles from '../NewCropModal/styles.module.scss';

class EditFieldCropModal extends React.Component {
  // props:

  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFieldCropPropertiesChange = this.handleFieldCropPropertiesChange.bind(this);
    this.handleValuesReset = this.handleValuesReset.bind(this);
    this.handleSubmitEditFieldCrop = this.handleSubmitEditFieldCrop.bind(this);

    this.state = {
      show: false,
      field: null,
      crops: [],
      isByArea: true,
      bed_config: null,
      fieldCrop: this.props.cropBeingEdited,
      area_unit: getUnit(this.props.farm, 'm2', 'ft2'),
      area_unit_label: getUnit(this.props.farm, 'm', 'ft'),
      estimated_unit: getUnit(this.props.farm, 'kg', 'lb'),
      percentage: 0,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { estimated_unit, area_unit } = this.state;
    const fieldCrop = this.state.fieldCrop;
    const estimated_yield = roundToTwoDecimal(
      convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg') /
        convertFromMetric(fieldCrop.area_used, area_unit, 'm2'),
    );
    const estimated_price =
      fieldCrop.estimated_production <= 0
        ? 0
        : roundToTwoDecimal(
            fieldCrop.estimated_revenue /
              convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg'),
          );
    const area_used = roundToTwoDecimal(convertFromMetric(fieldCrop.area_used, area_unit, 'm2'));
    this.setState({
      fieldCrop: { ...fieldCrop, estimated_price, estimated_yield, area_used },
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

  handleSubmitEditFieldCrop = () => {
    const { bed_config, isByArea, estimated_unit, area_unit } = this.state;
    let editedFieldCrop = this.state.fieldCrop;

    let { fieldArea } = this.props;
    if (this.state.area_unit === 'ft2') {
      fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    }

    if (moment(editedFieldCrop.end_date).isSameOrBefore(moment(editedFieldCrop.start_date))) {
      toastr.error(this.props.t('message:EDIT_FIELD_CROP.ERROR.END_DATE_BEFORE'));
      return;
    }

    editedFieldCrop.area_used =
      editedFieldCrop.area_used > fieldArea ? fieldArea : editedFieldCrop.area_used;

    let estimatedProduction = isByArea
      ? editedFieldCrop.estimated_yield * editedFieldCrop.area_used
      : editedFieldCrop.estimated_yield * bed_config.bed_num;
    let estimatedRevenue = isByArea
      ? estimatedProduction * editedFieldCrop.estimated_price
      : bed_config.bed_num * editedFieldCrop.estimated_price * editedFieldCrop.estimated_yield;

    estimatedProduction = convertToMetric(estimatedProduction, estimated_unit, 'kg');

    let yieldData = {
      crop_id: editedFieldCrop.crop_id,
      'quantity_kg/m2': editedFieldCrop.estimated_yield,
      date: moment().format(),
    };

    let priceData = {
      crop_id: editedFieldCrop.crop_id,
      value: editedFieldCrop.estimated_price,
      date: moment().format(),
    };

    this.props.dispatch(createYield(yieldData));
    this.props.dispatch(createPrice(priceData));
    this.props.dispatch(
      putFieldCrop({
        field_crop_id: parseInt(this.props.cropBeingEdited.field_crop_id, DEC_RADIX),
        crop_id: parseInt(editedFieldCrop.crop_id, DEC_RADIX),
        location_id: this.props.cropBeingEdited.location.location_id,
        start_date: editedFieldCrop.start_date,
        end_date: editedFieldCrop.end_date,
        area_used: convertToMetric(editedFieldCrop.area_used, area_unit, 'm2'),
        estimated_production: estimatedProduction,
        variety: editedFieldCrop.variety || '',
        estimated_revenue: estimatedRevenue,
        is_by_bed: !isByArea,
        bed_config,
      }),
    );
    this.setState({ show: false });

    this.handleValuesReset();
  };

  handleFieldCropPropertiesChange(event) {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
    let fieldCrop = this.state.fieldCrop;
    let cropBeingEdited = {
      ...fieldCrop,
      [event.target.id]: event.target.value,
    };
    this.setState({
      fieldCrop: cropBeingEdited,
    });
  }

  handleValuesReset() {
    let fieldCrop = JSON.parse(JSON.stringify(this.props.cropBeingEdited));
    let is_by_bed = fieldCrop.is_by_bed;
    let bed_config = fieldCrop.bed_config;
    const { estimated_unit, area_unit } = this.state;

    let percentage = 0;
    if (is_by_bed) {
      fieldCrop.estimated_yield =
        bed_config.bed_num <= 0
          ? 0
          : roundToTwoDecimal(
              convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg') /
                bed_config.bed_num,
            );
      fieldCrop.estimated_price =
        fieldCrop.estimated_production <= 0
          ? 0
          : roundToTwoDecimal(
              fieldCrop.estimated_revenue / bed_config.bed_num / fieldCrop.estimated_yield,
            );
    } else {
      fieldCrop.estimated_yield = roundToTwoDecimal(
        convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg') /
          convertFromMetric(fieldCrop.area_used, area_unit, 'm2'),
      );

      fieldCrop.estimated_price =
        fieldCrop.estimated_production <= 0
          ? 0
          : roundToTwoDecimal(
              fieldCrop.estimated_revenue /
                convertFromMetric(fieldCrop.estimated_production, estimated_unit, 'kg'),
            );

      percentage = Number(((fieldCrop.area_used / this.props.fieldArea) * 100).toFixed(2));
    }

    const area_used = roundToTwoDecimal(convertFromMetric(fieldCrop.area_used, area_unit, 'm2'));

    this.setState({
      fieldCrop: { ...fieldCrop, area_used },
      isByArea: !fieldCrop.is_by_bed,
      bed_config: fieldCrop.bed_config,
      percentage,
    });
  }

  onBedLenChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_length = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used =
      Number(bed_length) * Number(bed_config.bed_width) * Number(bed_config.bed_num);
    bed_config.bed_length = bed_length;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

  onBedWidthChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_width = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used =
      Number(bed_config.bed_length) * Number(bed_width) * Number(bed_config.bed_num);
    bed_config.bed_width = bed_width;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

  onBedNumChange = (e) => {
    e.target.value = e.target.value >= 0 ? e.target.value : 0;
    let bed_num = e.target.value;
    let { bed_config, fieldCrop } = this.state;
    fieldCrop.area_used =
      Number(bed_config.bed_length) * Number(bed_config.bed_width) * Number(bed_num);
    bed_config.bed_num = bed_num;
    this.setState({
      fieldCrop,
      bed_config,
    });
  };

  handlePercentage = (e) => {
    let { fieldCrop } = this.state;
    if (e.target.value < 0) {
      e.target.value = 0;
    }

    if (e.target.value > 100) {
      e.target.value = 100;
    }

    let { fieldArea } = this.props;

    fieldArea = roundToTwoDecimal(convertFromMetric(fieldArea, this.state.area_unit, 'm2'));
    fieldCrop.area_used = ((Number(e.target.value) / 100) * fieldArea).toFixed(0);
    this.setState({
      fieldCrop,
      percentage: Number(e.target.value),
    });
  };

  onStartDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.start_date = date.format('YYYY-MM-DD');
    this.setState({ fieldCrop: currentCrop });
  };

  onEndDateChange = (date) => {
    const currentCrop = this.state.fieldCrop;
    currentCrop.end_date = date.format('YYYY-MM-DD');
    this.setState({ fieldCrop: currentCrop });
  };

  render() {
    const { isByArea, bed_config } = this.state;
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
                      value={(this.state.fieldCrop.area_used / 10000).toFixed(2)}
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
                  value={this.state.fieldCrop.area_used}
                />
              </FormGroup>
              <h4 style={{ textAlign: 'center' }}>
                {this.props.t('FIELDS.EDIT_FIELD.CROP.ENTER_START_FINISH')}
              </h4>
              <FormGroup controlId="start_date">
                <DateContainer
                  date={moment(this.state.fieldCrop.start_date)}
                  onDateChange={this.onStartDateChange}
                  placeholder={this.props.t('FIELDS.EDIT_FIELD.CROP.CHOOSE_START_DATE')}
                />
              </FormGroup>
              <FormGroup controlId="end_date">
                <DateContainer
                  date={moment(this.state.fieldCrop.end_date)}
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
                  value={this.state.fieldCrop.estimated_price}
                  onChange={(e) => this.handleFieldCropPropertiesChange(e)}
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
                  value={this.state.fieldCrop.estimated_yield}
                  onChange={(e) => this.handleFieldCropPropertiesChange(e)}
                />
              </FormGroup>
            </FormGroup>
          </div>

          <div style={{ display: 'inline-flex', gap: ' 8px', marginTop: '16px', width: '100%' }}>
            <Button fullLength color={'secondary'} sm onClick={this.handleClose}>
              {this.props.t('common:CLOSE')}
            </Button>
            <Button
              sm
              fullLength
              onClick={() => {
                this.handleSubmitEditFieldCrop();
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditFieldCropModal));
