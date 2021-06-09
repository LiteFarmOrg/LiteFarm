import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import PageTitle from '../../../components/PageTitle/v2';
import moment from 'moment';
import history from '../../../history';

import { diseaseSelector, pesticideSelector } from '../PestControlLog/selectors';
import { currentLogSelector } from './selectors';
import {
  convertFromMetric,
  getLanguageFromLocalStorage,
  getUnit,
  roundToFourDecimal,
  roundToTwoDecimal,
} from '../../../util';
import { getFertilizers } from '../FertilizingLog/actions';
import { fertSelector } from '../FertilizingLog/selectors';
import { deleteLog } from '../Utility/actions';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedFieldCropsSelector } from '../../fieldCropSlice';
import { Semibold } from '../../../components/Typography';
import { canEdit, canEditStepOne, canEditStepThree, canEditStepTwo } from '../Utility/logSlice';
import DropdownButton from '../../../components/Form/DropDownButton';
import { cropLocationsSelector } from '../../locationSlice';
import ScrollToTop from '../../hooks/ScrollToTop';

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
  typeLabels = (type) => {
    const typeLabel = {
      systemicSpray: this.props.t('LOG_PESTICIDE.SYSTEMIC_SPRAY'),
      foliarSpray: this.props.t('LOG_PESTICIDE.FOLIAR_SPRAY'),
      handPick: this.props.t('LOG_PESTICIDE.HAND_PICK'),
      biologicalControl: this.props.t('LOG_PESTICIDE.BIOLOGICAL_CONTROL'),
      burning: this.props.t('LOG_PESTICIDE.BURNING'),
      soilFumigation: this.props.t('LOG_PESTICIDE.SOIL_FUMIGATION'),
      heatTreatment: this.props.t('LOG_PESTICIDE.HEAT_TREATMENT'),
      plow: this.props.t('LOG_FIELD_WORK.PLOW'),
      ridgeTill: this.props.t('LOG_FIELD_WORK.RIDGE_TILL'),
      zoneTill: this.props.t('LOG_FIELD_WORK.ZONE_TILL'),
      mulchTill: this.props.t('LOG_FIELD_WORK.MULCH_TILL'),
      ripping: this.props.t('LOG_FIELD_WORK.RIPPING'),
      discing: this.props.t('LOG_FIELD_WORK.DISCING'),
      sprinkler: this.props.t('LOG_IRRIGATION.SPRINKLER'),
      drip: this.props.t('LOG_IRRIGATION.DRIP'),
      subsurface: this.props.t('LOG_IRRIGATION.SUBSURFACE'),
      flood: this.props.t('LOG_IRRIGATION.FLOOD'),
      Harvest: this.props.t('LOG_HARVEST.HARVEST'),
      harvest: this.props.t('LOG_HARVEST.HARVEST'),
      Pest: this.props.t('LOG_HARVEST.PEST'),
      pest: this.props.t('LOG_HARVEST.PEST'),
      Disease: this.props.t('LOG_HARVEST.DISEASE'),
      disease: this.props.t('LOG_HARVEST.DISEASE'),
      Weed: this.props.t('LOG_HARVEST.WEED'),
      weed: this.props.t('LOG_HARVEST.WEED'),
      Other: this.props.t('LOG_HARVEST.OTHER'),
      other: this.props.t('LOG_HARVEST.OTHER'),
      sand: this.props.t('soil:SAND'),
      loamySand: this.props.t('soil:LOAMY_SAND'),
      sandyLoam: this.props.t('soil:SANDY_LOAM'),
      loam: this.props.t('soil:LOAM'),
      siltLoam: this.props.t('soil:SILT_LOAM'),
      silt: this.props.t('soil:SILT'),
      sandyClayLoam: this.props.t('soil:SANDY_CLAYLOAM'),
      clayLoam: this.props.t('soil:CLAY_LOAM'),
      siltyClayLoam: this.props.t('soil:SILTY_CLAYLOAM'),
      sandyClay: this.props.t('soil:SANDY_CLAY'),
      siltyClay: this.props.t('soil:SILTY_CLAY'),
      clay: this.props.t('soil:CLAY'),
    };
    return typeLabel[type];
  }


  componentDidMount() {
    this.props.dispatch(getFertilizers());
  }

  getKindname = (activityKind) => {
    switch (activityKind) {
      case 'fertilizing':
        return this.props.t(`LOG_FERTILIZING.TITLE`);
      case 'pestControl':
        return this.props.t(`LOG_PESTICIDE.TITLE`);
      case 'harvest':
        return this.props.t(`LOG_HARVEST.TITLE`);
      case 'seeding':
        return this.props.t(`LOG_SEEDING.TITLE`);
      case 'fieldWork':
        return this.props.t(`LOG_FIELD_WORK.TITLE`);
      case 'soilData':
        return this.props.t(`LOG_SOIL.TITLE`);
      case 'irrigation':
        return this.props.t(`LOG_IRRIGATION.TITLE`);
      case 'scouting':
        return this.props.t(`LOG_SCOUTING.TITLE`);
      case 'other':
      default:
        return this.props.t(`LOG_OTHER.TITLE`);
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
    const { diseases } = this.props;

    for (let d of diseases) {
      if (d.disease_id === d_id) {
        return d.farm_id
          ? d.disease_common_name
          : this.props.t(`disease:name.${d.disease_name_translation_key}`);
      }
    }

    return 'no name';
  };

  getPesticideName = (p_id) => {
    const { pesticides } = this.props;

    for (let p of pesticides) {
      if (p.pesticide_id === p_id) {
        return p.farm_id ?
          p.pesticide_name :
          this.props.t(`disease:PESTICIDE.${p.pesticide_translation_key}`);
      }
    }

    return 'no name';
  };

  editLog = (activityKind) => {
    const url = this.getEditURL(activityKind);
    if (activityKind === 'harvest') {
      this.props.dispatch(canEditStepOne(true));
      this.props.dispatch(canEditStepTwo(true));
      this.props.dispatch(canEditStepThree(true));
      this.props.dispatch(canEdit(true));
      history.push(`${url}`);
    } else {
      history.push(`${url}/edit`);
    }
  };

  confirmDelete = () => {
    this.setState({
      showModal: true,
    });
  };

  hasSameCrop = (fieldCrop) => {
    let { selectedLog } = this.props;

    for (let fc of selectedLog.fieldCrop) {
      if (
        fc.field_crop_id !== fieldCrop.field_crop_id &&
        fieldCrop.crop.crop_id === fc.crop.crop_id
      ) {
        return true;
      }
    }

    return false;
  };

  getFertName = (fert_id) => {
    let { fertilizers } = this.props;
    for (let f of fertilizers) {
      if (f.fertilizer_id === fert_id) {
        return this.props.t(`fertilizer:${f.fertilizer_translation_key}`);
      }
    }
    return 'No type';
  };

  onBack = () => {
    history.push('/log');
  };

  render() {
    let { selectedLog, farm } = this.props;
    const language = getLanguageFromLocalStorage();
    let { quantity_unit, space_unit, rate_unit, ratePerMin } = this.state;
    const options = [
      {
        text: this.props.t('common:EDIT'),
        onClick: () => this.editLog(selectedLog.activity_kind),
      },
      { text: this.props.t('common:DELETE'), onClick: () => this.confirmDelete() },
    ];

    let date, regularName;
    if (selectedLog) {
      let logDate = moment(selectedLog.date).locale(language);
      date = logDate.format('MMMM DD, YYYY');
      let typeName;
      if (selectedLog.activity_kind === 'pestControl') {
        typeName = selectedLog.pestControlLog.type
      }
      if (selectedLog.activity_kind === 'soilData') {
        typeName = selectedLog.soilDataLog.texture
      }
      if (selectedLog.activity_kind === 'fieldWork') {
        typeName = selectedLog.fieldWorkLog.type;
      }
      if (selectedLog.activity_kind === 'irrigation') {
        typeName = selectedLog.irrigationLog.type;
      }
      if (selectedLog.activity_kind === 'scouting') {
        typeName = selectedLog.scoutingLog.type;
      }
      regularName = this.typeLabels(typeName);
    }

    let dropDown = 0;

    return (
      <div className={styles.logContainer}>
        <ScrollToTop />
        <PageTitle onGoBack={this.onBack} title={this.props.t('LOG_DETAIL.TITLE')} />
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>
              <strong> {date}</strong>
            </div>
            {(Number(farm.role_id) === 1 ||
              Number(farm.role_id) === 2 ||
              Number(farm.role_id) === 5 ||
              Number(farm.role_id) === 3) && (
              <DropdownButton options={options}>{this.props.t('LOG_COMMON.ACTION')}</DropdownButton>
            )}
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>{this.props.t('LOG_DETAIL.SUBMITTED_FOR')}</div>
            <span>{selectedLog.first_name + ' ' + selectedLog.last_name}</span>
          </div>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>{this.props.t('LOG_DETAIL.ACTIVITY_KIND')}</div>
            <span>{this.getKindname(selectedLog.activity_kind)}</span>
          </div>
        </div>

        {selectedLog.fieldCrop.length > 0 && (
          <div className={styles.infoBlock}>
            <div className={styles.fcInfo}>
              <div style={{ marginBottom: '10px' }}>{this.props.t('LOG_COMMON.FIELD_CROPS')}</div>
              <div className={styles.fieldCropList}>
                {selectedLog.fieldCrop.map((fc) => {
                  let hasDup = this.hasSameCrop(fc);
                  if (hasDup) {
                    return (
                      <div className={styles.innerList} key={fc.field_crop_id}>
                        <div>{this.props.t(`crop:${fc.crop.crop_translation_key}`)}</div>
                        <p>{moment(fc.start_date).format('YYYY-MM-DD')}</p>
                      </div>
                    );
                  } else
                    return (
                      <p key={fc.field_crop_id}>
                        {this.props.t(`crop:${fc.crop.crop_translation_key}`)}
                      </p>
                    );
                })}
              </div>
            </div>
          </div>
        )}
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>{this.props.t('LOG_COMMON.FIELDS')}</div>
            <div className={styles.innerTaskList}>
              {selectedLog.location.map((f) => {
                return <p>{f.name}</p>;
              })}
            </div>
          </div>
        </div>
        {selectedLog.activity_kind === 'pestControl' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_PESTICIDE.PESTICIDE_NAME_LABEL')}</div>
                <span>{this.getPesticideName(selectedLog.pestControlLog.pesticide_id)}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>
                  {this.props.t('LOG_PESTICIDE.PESTICIDE_QUANTITY')} ({this.state.quantity_unit})
                </div>
                {quantity_unit === 'lb' && (
                  <span>
                    {roundToTwoDecimal(
                      convertFromMetric(
                        selectedLog.pestControlLog.quantity_kg,
                        quantity_unit,
                        'kg',
                        false,
                      ),
                    )}
                  </span>
                )}
                {quantity_unit === 'kg' && (
                  <span>{roundToTwoDecimal(selectedLog.pestControlLog.quantity_kg)}</span>
                )}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_PESTICIDE.PESTICIDE_CONTROL_TYPE')}</div>
                <span>{regularName}</span>
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.fcInfo}>
                <div style={{ marginBottom: '10px' }}>
                  {this.props.t('LOG_PESTICIDE.TARGET_DISEASE')}
                </div>
                <div className={styles.innerList}>
                  {this.getDiseaseName(selectedLog.pestControlLog.target_disease_id)}
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedLog.activity_kind === 'fertilizing' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.fcInfo}>
                <div style={{ marginBottom: '10px' }}>
                  {this.props.t('LOG_FERTILIZING.FERTILIZER_TYPE')}
                </div>
                <div className={styles.innerList}>
                  {this.getFertName(selectedLog.fertilizerLog.fertilizer_id)}
                </div>
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>
                  {this.props.t('LOG_FERTILIZING.FERTILIZING_QUANTITY')}({quantity_unit})
                </div>
                {quantity_unit === 'lb' && (
                  <span>
                    {roundToTwoDecimal(
                      convertFromMetric(
                        selectedLog.fertilizerLog.quantity_kg,
                        quantity_unit,
                        'kg',
                        false,
                      ),
                    )}
                  </span>
                )}
                {quantity_unit === 'kg' && (
                  <span>{roundToTwoDecimal(selectedLog.fertilizerLog.quantity_kg)}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'harvest' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{`${this.props.t('LOG_HARVEST.HARVEST_QUANTITY')} (${quantity_unit})`}</div>
                {quantity_unit === 'lb' && (
                  <span>
                    {roundToTwoDecimal(
                      convertFromMetric(
                        selectedLog.harvestLog.quantity_kg,
                        quantity_unit,
                        'kg',
                        false,
                      ),
                    )}
                  </span>
                )}
                {quantity_unit === 'kg' && (
                  <span>{roundToTwoDecimal(selectedLog.harvestLog.quantity_kg)}</span>
                )}
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.harvestUseInfo}>
                <div className={styles.harvestUseHeader}>
                  <div>{this.props.t('LOG_HARVEST.HARVEST_USE')}</div>
                  <div>{`${this.props.t('LOG_HARVEST.QUANTITY')} (${quantity_unit})`}</div>
                </div>
                {selectedLog.harvestUse?.map((use) => (
                  <div className={styles.harvestUseItem}>
                    <Semibold style={{ color: 'var(--teal900)' }}>
                      {this.props.t(
                        `harvest_uses:${use.harvestUseType.harvest_use_type_translation_key}`,
                      )}
                    </Semibold>
                    <div>
                      <Semibold style={{ color: 'var(--teal900)' }}>
                        {quantity_unit === 'lb'
                          ? roundToTwoDecimal(
                              convertFromMetric(use.quantity_kg, quantity_unit, 'kg', false),
                            )
                          : roundToTwoDecimal(use.quantity_kg)}
                      </Semibold>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'soilData' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_SOIL.SOIL_TEXTURE')}</div>
                <span>{regularName}</span>
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'fieldWork' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.TYPE')}</div>
                <span>{regularName}</span>
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'seeding' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_SEEDING.SPACE_DEPTH')}</div>
                <span>
                  {roundToFourDecimal(
                    convertFromMetric(
                      selectedLog.seedLog.space_depth_cm,
                      this.state.space_unit,
                      'cm',
                    ),
                  )}{' '}
                  {space_unit}
                </span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_SEEDING.SPACE_LENGTH')}</div>
                <span>
                  {roundToFourDecimal(
                    convertFromMetric(
                      selectedLog.seedLog.space_length_cm,
                      this.state.space_unit,
                      'cm',
                    ),
                  )}{' '}
                  {space_unit}
                </span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_SEEDING.SPACE_WIDTH')}</div>
                <span>
                  {roundToFourDecimal(
                    convertFromMetric(
                      selectedLog.seedLog.space_width_cm,
                      this.state.space_unit,
                      'cm',
                    ),
                  )}{' '}
                  {space_unit}
                </span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_SEEDING.RATE')}</div>
                <span>
                  {roundToFourDecimal(
                    convertFromMetric(selectedLog.seedLog['rate_seeds/m2'], rate_unit, 'm2', true),
                  )}{' '}
                  {'seeds/' + rate_unit}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'irrigation' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.TYPE')}</div>
                <span>{regularName}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.FLOW_RATE')}</div>
                <span>
                  {roundToFourDecimal(
                    convertFromMetric(
                      selectedLog.irrigationLog['flow_rate_l/min'],
                      ratePerMin,
                      'l/min',
                    ),
                  )}
                  {` ${ratePerMin}`}
                </span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.HOURS')}</div>
                <span>{selectedLog.irrigationLog.hours}</span>
              </div>
            </div>
          </div>
        )}

        {selectedLog.activity_kind === 'scouting' && (
          <div>
            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.TYPE')}</div>
                <span>{regularName}</span>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.innerInfo}>
                <div>{this.props.t('LOG_DETAIL.ACTION_NEEDED')}</div>
                {selectedLog.action_needed && <span>{this.props.t('LOG_DETAIL.YES')}</span>}
                {!selectedLog.action_needed && <span>{this.props.t('LOG_DETAIL.NO')}</span>}
              </div>
            </div>
          </div>
        )}

        <div className={styles.infoBlock}>
          <div className={styles.fcInfo}>
            <div style={{ marginBottom: '10px' }}>{this.props.t('LOG_DETAIL.NOTE')}</div>
            <div className={styles.innerList}>{selectedLog.notes}</div>
          </div>
        </div>

        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {
            this.props.dispatch(deleteLog(selectedLog.activity_id));
          }}
          message={this.props.t('LOG_COMMON.DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locations: cropLocationsSelector(state),
    farm: userFarmSelector(state),
    crops: currentAndPlannedFieldCropsSelector(state),
    users: userFarmSelector(state),
    selectedLog: currentLogSelector(state),
    diseases: diseaseSelector(state),
    pesticides: pesticideSelector(state),
    fertilizers: fertSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LogDetail));
