import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import PageTitle from '../../../components/PageTitle';
import moment from 'moment';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import history from '../../../history';
import { cropSelector, fieldSelector } from '../../selector';
import { currentLogSelector } from './selectors';
import { diseaseSelector, pesticideSelector } from '../PestControlLog/selectors';
import { convertFromMetric, getUnit, roundToFourDecimal, roundToTwoDecimal } from '../../../util';
import { getFertilizers } from '../FertilizingLog/actions';
import { fertSelector } from '../FertilizingLog/selectors';
import { deleteLog } from '../Utility/actions';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';

class LogDetail extends Component {
  constructor(props) {
    super(props);
    const farm = this.props.farm || {};
    this.state = {
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
      space_unit: getUnit(farm, 'cm', 'in'),
      rate_unit: getUnit(farm, 'm2', 'ft2'),
      ratePerMin: getUnit(farm, 'l/min', 'gal/min'),
      ratePerHr: getUnit(farm, 'l/h', 'gal/h'),
      showModal: false,
    };
  }


  componentDidMount() {
    this.props.dispatch(getFertilizers());
  }

  getKindname = (activityKind) => {
    switch (activityKind) {
      case 'fertilizing':
        return 'Fertilizing Log';
      case 'pestControl':
        return 'Pest Control Log';
      case 'harvest':
        return 'Harvest Log';
      case 'seeding':
        return 'Seeding Log';
      case 'fieldWork':
        return 'Field Work Log';
      case 'soilData':
        return 'Soil Data Log';
      case 'irrigation':
        return 'Irrigation Log';
      case 'scouting':
        return 'Scouting Log';
      case 'other':
      default:
        return 'Other Log';
    }
  };

  getEditURL = (activityKind) => {
    switch (activityKind) {
      case 'fertilizing':
        return 'fertilizing_log';
      case 'pestControl':
        return 'pest_control_log';
      case 'harvest':
        return 'harvest_log';
      case 'seeding':
        return 'seeding_log';
      case 'fieldWork':
        return 'field_work_log';
      case 'soilData':
        return 'soil_data_log';
      case 'irrigation':
        return 'irrigation_log';
      case 'scouting':
        return 'scouting_log';
      case 'other':
      default:
        return 'other_log';
    }
  };

  getDiseaseName = (d_id) => {
    const {diseases} = this.props;

    for (let d of diseases) {
      if (d.disease_id === d_id) {

        return d.disease_common_name;
      }
    }

    return 'no name';
  };

  getPesticideName = (p_id) => {
    const {pesticides} = this.props;

    for (let p of pesticides) {
      if (p.pesticide_id === p_id) {
        return p.pesticide_name;
      }
    }

    return 'no name';

  };

  editLog = (activityKind) => {
    const url = this.getEditURL(activityKind);
    history.push(`${url}/edit`);
  };


  confirmDelete = () => {
    this.setState({
      showModal: true,
    })

  };

  hasSameCrop = (fieldCrop) => {

    let {selectedLog} = this.props;

    for (let fc of selectedLog.fieldCrop) {
      if (fc.field_crop_id !== fieldCrop.field_crop_id && fieldCrop.crop.crop_id === fc.crop.crop_id) {
        return true;
      }
    }

    return false;
  };

  getFertName = (fert_id) => {
    let {fertilizers} = this.props;
    for(let f of fertilizers){
      if(f.fertilizer_id === fert_id){
        return f.fertilizer_type;
      }
    }
    return 'No type';
  };

  render() {
    let {selectedLog, farm} = this.props;
    let {quantity_unit, space_unit, rate_unit} = this.state;

    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date, regularName;
    if (selectedLog) {
      let logDate = moment(selectedLog.date);
      date = months[logDate.month()] + ' ' + logDate.date().toString() + ', ' + logDate.year().toString();
      let typeName;
      if (selectedLog.activity_kind === 'pestControl') {
        typeName = selectedLog.pestControlLog.type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
      if (selectedLog.activity_kind === 'soilData') {
        typeName = selectedLog.soilDataLog.texture.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
      if (selectedLog.activity_kind === 'fieldWork') {
        typeName = selectedLog.fieldWorkLog.type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
      if (selectedLog.activity_kind === 'irrigation') {
        typeName = selectedLog.irrigationLog.type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
      if (selectedLog.activity_kind === 'scouting') {
        typeName = selectedLog.scoutingLog.type.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        regularName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      }
    }

    let dropDown = 0;
    if (selectedLog) return (
      <div className={styles.logContainer}>
        <PageTitle backUrl="/log" title="Log Detail"/>
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>
              <strong> {date}</strong>
            </div>
            {
              (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 5) &&
              <DropdownButton
                style={{background: '#EFEFEF', color: '#4D4D4D', border: 'none'}}
                title={'Action'}
                key={dropDown}
                id={`dropdown-basic-${dropDown}`}
              >
                <Dropdown.Item eventKey="0" onClick={() => this.editLog(selectedLog.activity_kind)}>Edit</Dropdown.Item>
                <Dropdown.Item eventKey="1" onClick={() => this.confirmDelete()}>Delete</Dropdown.Item>
              </DropdownButton>
            }
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>Submitted For</div>
            <span>{selectedLog.first_name + ' ' + selectedLog.last_name}</span>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>Activity Kind</div>
            <span>{this.getKindname(selectedLog.activity_kind)}</span>
          </div>
        </div>

        {
          (selectedLog.fieldCrop.length > 0) && <div className={styles.infoBlock}>
            <div className={styles.fcInfo}>
              <div style={{marginBottom: '10px'}}>Field Crops</div>
              <div className={styles.fieldCropList}>
                {selectedLog.fieldCrop.map((fc) => {
                  let hasDup = this.hasSameCrop(fc);
                  if (hasDup) {
                    return <div className={styles.innerList} key={fc.field_crop_id}>
                      <div>{fc.crop.crop_common_name}</div>
                      <p>{moment(fc.start_date).format('YYYY-MM-DD')}</p>
                    </div>
                  }
                  else return <p key={fc.field_crop_id}>{fc.crop.crop_common_name}</p>
                })
                }
              </div>
            </div>
          </div>
        }
        {
          (selectedLog.fieldCrop.length < 1) && <div className={styles.infoBlock}>
            <div className={styles.innerInfo}>
              <div>Fields</div>
              <div className={styles.innerTaskList}>
                {selectedLog.field.map((f) => {
                  return <p>{f.field_name}</p>
                })
                }
              </div>
            </div>
          </div>
        }
        {
          (selectedLog.activity_kind === 'pestControl') &&
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Pesticide Name</div>
                <span>{this.getPesticideName(selectedLog.pestControlLog.pesticide_id)}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Pesticide Quantity ({this.state.quantity_unit})</div>
                {
                  quantity_unit === 'lb' && <span>{roundToTwoDecimal(convertFromMetric(selectedLog.pestControlLog.quantity_kg, quantity_unit, 'kg', false))}</span>
                }
                {
                  quantity_unit === 'kg' && <span>{roundToTwoDecimal(selectedLog.pestControlLog.quantity_kg)}</span>
                }
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Pesticide Control Type</div>
                <span>{regularName}</span>
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.fcInfo}>
                <div style={{marginBottom: '10px'}}>Targeted Disease</div>
                <div
                  className={styles.innerList}>{this.getDiseaseName(selectedLog.pestControlLog.target_disease_id)}</div>
              </div>
            </div>
          </div>
        }
        {
          (selectedLog.activity_kind === 'fertilizing') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.fcInfo}>
                <div style={{marginBottom: '10px'}}>Fertilizer Type</div>
                <div className={styles.innerList}>{this.getFertName(selectedLog.fertilizerLog.fertilizer_id)}</div>
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Fertilizer Quantity ({quantity_unit})</div>
                {
                  quantity_unit === 'lb' && <span>{roundToTwoDecimal(convertFromMetric(selectedLog.fertilizerLog.quantity_kg, quantity_unit, 'kg', false))}</span>
                }
                {
                  quantity_unit === 'kg' && <span>{roundToTwoDecimal(selectedLog.fertilizerLog.quantity_kg)}</span>
                }
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'harvest') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Harvest Quantity ({quantity_unit})</div>
                {
                  quantity_unit === 'lb' && <span>{convertFromMetric(selectedLog.harvestLog.quantity_kg, quantity_unit, 'kg', false)}</span>
                }
                {
                  quantity_unit === 'kg' && <span>{selectedLog.harvestLog.quantity_kg}</span>
                }
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'soilData') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Soil Texture</div>
                <span>{regularName}</span>
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'fieldWork') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Type</div>
                <span>{regularName}</span>
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'seeding') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Space Depth</div>
                <span>{roundToFourDecimal(convertFromMetric(selectedLog.seedLog.space_depth_cm, this.state.space_unit, 'cm'))} {space_unit}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Space Length</div>
                <span>{roundToFourDecimal(convertFromMetric(selectedLog.seedLog.space_length_cm, this.state.space_unit, 'cm'))} {space_unit}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Space Width</div>
                <span>{roundToFourDecimal(convertFromMetric(selectedLog.seedLog.space_width_cm, this.state.space_unit, 'cm'))} {space_unit}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Rate</div>
                <span>{roundToFourDecimal(convertFromMetric(selectedLog.seedLog['rate_seeds/m2'], rate_unit, 'm2', true))} {'seeds/' + rate_unit}</span>
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'irrigation') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Type</div>
                <span>{regularName}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Flow Rate</div>
                <span>{selectedLog.irrigationLog['flow_rate_l/min']} {selectedLog.irrigationLog.flow_rate_unit}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Hours</div>
                <span>{selectedLog.irrigationLog.hours}</span>
              </div>
            </div>
          </div>
        }

        {
          (selectedLog.activity_kind === 'scouting') && <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Type</div>
                <span>{regularName}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>Action Needed</div>
                {
                  selectedLog.action_needed &&
                  <span>Yes</span>
                }
                {
                  !selectedLog.action_needed &&
                  <span>No</span>
                }
              </div>
            </div>
          </div>
        }

        <div className={styles.infoBlock}>
          <div className={styles.fcInfo}>
            <div style={{marginBottom: '10px'}}>Note</div>
            <div className={styles.innerList}>{selectedLog.notes}</div>
          </div>
        </div>

        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {this.props.dispatch(deleteLog(selectedLog.activity_id)); history.push('/Log');}}
          message='Are you sure you want to delete this log?'
        />
      </div>
    )
  }

}


const mapStateToProps = (state) => {
  return {
    fields: fieldSelector(state),
    farm: userFarmSelector(state),
    crops: cropSelector(state),
    users: userFarmSelector(state),
    selectedLog: currentLogSelector(state),
    diseases: diseaseSelector(state),
    pesticides: pesticideSelector(state),
    fertilizers: fertSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(LogDetail);
