import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import PageTitle from '../../../components/PageTitle';
import { Col, Container, Row, Button } from 'react-bootstrap';
import SalesImg from '../../../assets/images/harvestUseType/Sales.svg';
import SelfConsumptionImg from '../../../assets/images/harvestUseType/SelfConsumption.svg';
import AnimalFeedImg from '../../../assets/images/harvestUseType/AnimalFeed.svg';
import CompostImg from '../../../assets/images/harvestUseType/Compost.svg';
import GiftImg from '../../../assets/images/harvestUseType/Gift.svg';
import ExchangeImg from '../../../assets/images/harvestUseType/Exchange.svg';
import SavedForSeedImg from '../../../assets/images/harvestUseType/SavedForSeed.svg';
import NotSureImg from '../../../assets/images/harvestUseType/NotSure.svg';
import OtherImg from '../../../assets/images/harvestUseType/Other.svg';
import DonationImg from '../../../assets/images/harvestUseType/Donation.svg';
import history from '../../../history';
import { withTranslation } from 'react-i18next';
import { userFarmSelector } from '../../userFarmSlice';
import { setSelectedUseTypes, addHarvestUseType } from '../actions';
import PurePopupMiniForm from '../../../components/PopupMiniForm';
import { setAllHarvestUseTypesSelector, selectedUseTypeSelector } from '../selectors';

class HarvestUseType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultUseTypeNames: [
        'Sales',
        'Self-Consumption',
        'Animal Feed',
        'Compost',
        'Gift',
        'Exchange',
        'Saved for seed',
        'Not Sure',
        'Donation',
        'Other',
      ],
      imgDict: {
        Sales: SalesImg,
        'Self-Consumption': SelfConsumptionImg,
        'Animal Feed': AnimalFeedImg,
        Compost: CompostImg,
        Gift: GiftImg,
        Exchange: ExchangeImg,
        'Saved for seed': SavedForSeedImg,
        'Not Sure': NotSureImg,
        Donation: DonationImg,
        Other: OtherImg,
      },
      useTypeSelected: {
        width: '80px',
        height: '80px',
        background: '#00756A',
        borderRadius: '50px',
        margin: '0 auto',
      },
      useTypeUnSelected: {
        width: '80px',
        height: '80px',
        background: '#7BCFA2',
        borderRadius: '50px',
        margin: '0 auto',
      },
      selectedUseTypes: [],
      useTypeClicked: false,
      currId: 0,
      showAdd: false,
      disabled: true,
    };
    this.assignImage = this.assignImage.bind(this);

    if (this.props.useType) {
      this.props.useType.some((item) => this.logClick(item));
    }
    console.log(this.props.useType);
  }

  assignImage(useTypeName) {
    if (this.state.defaultUseTypeNames.includes(useTypeName)) {
      return this.state.imgDict[useTypeName];
    } else return OtherImg;
  }

  logClick(type) {
    this.setState({
      useTypeClicked: !this.state.useTypeClicked,
      currId: type.harvest_use_type_id,
    });

    if (
      !this.state.selectedUseTypes.some(
        (item) => item.harvest_use_type_id === type.harvest_use_type_id,
      )
    ) {
      let selectedUses = this.state.selectedUseTypes;
      selectedUses.push(type);
      this.setState({
        selectedUses: selectedUses,
      });
    } else {
      if (
        this.state.selectedUseTypes.some(
          (item) => item.harvest_use_type_id === type.harvest_use_type_id,
        )
      ) {
        let index = this.state.selectedUseTypes
          .map(function (x) {
            return x.harvest_use_type_id;
          })
          .indexOf(type.harvest_use_type_id);
        let selectedUses = this.state.selectedUseTypes;
        selectedUses.splice(index, 1);
        this.setState({
          selectedUses: selectedUses,
        });
      }
    }

    this.state.selectedUseTypes.length >= 1
      ? (this.state.disabled = false)
      : (this.state.disabled = true);
  }

  openAddModal = () => {
    this.setState({ showAdd: true });
  };

  closeAddModal = () => {
    this.setState({ showAdd: false });
  };

  addCustomType = (typeName) => {
    if (typeName !== '') {
      this.props.dispatch(addHarvestUseType(typeName));
      this.closeAddModal();
    }
  };

  render() {
    return (
      <div className={styles.logContainer}>
        <div className={styles.textContainer}>
          <PageTitle
            title={this.props.t('LOG_HARVEST.HARVEST_USE_TYPE_TITLE')}
            backUrl="/harvest_log"
            isHarvestLogStep={true}
          />
        </div>
        <h4>{this.props.t('LOG_HARVEST.HARVEST_USE_TYPE_SUBTITLE')}</h4>
        <Container
          fluid={true}
          style={{
            marginLeft: 0,
            marginRight: 0,
            padding: '0 3%',
            marginTop: '5%',
            width: '100%',
          }}
        >
          <Row className="show-grid">
            {this.props.allUseType.map((type) => {
              const taskName = this.props.t(
                `harvest_uses:${type.harvest_use_type_translation_key}`,
              );
              const buttonImg = this.assignImage(taskName);
              return (
                <Col
                  xs={4}
                  md={4}
                  className={styles.imgCol}
                  onClick={() => {
                    this.logClick(type);
                  }}
                >
                  <div
                    style={
                      this.state.selectedUseTypes.some(
                        (item) => item.harvest_use_type_id === type.harvest_use_type_id,
                      )
                        ? this.state.useTypeSelected
                        : this.state.useTypeUnSelected
                    }
                    className={styles.circleButton}
                  >
                    <img src={buttonImg} alt="" />
                  </div>
                  <div className={styles.buttonName}>{taskName}</div>
                </Col>
              );
            })}
          </Row>
        </Container>

        {this.props.users.role_id !== 3 && (
          <div className={styles.buttonContainer}>
            <Button onClick={this.openAddModal} style={{ marginBottom: '100px' }}>
              {this.props.t('LOG_HARVEST.ADD_CUSTOM_USE_TYPE')}
            </Button>
          </div>
        )}

        <div className={styles.bottomContainer}>
          <div
            className={styles.backButton}
            onClick={() => {
              this.props.dispatch(setSelectedUseTypes(this.state.selectedUseTypes));
              history.push('/harvest_log');
            }}
          >
            {this.props.t('common:BACK')}
          </div>
          <button
            className="btn btn-primary-round"
            onClick={() => {
              this.state.selectedUseTypes = this.state.selectedUseTypes.map(function (elem) {
                let key = Object.assign({}, elem);
                key.quantity = 0;
                return key;
              });
              this.props.dispatch(setSelectedUseTypes(this.state.selectedUseTypes));
              history.push('/harvest_allocation');
            }}
            disabled={this.state.disabled}
          >
            {this.props.t('common:NEXT')}
          </button>
        </div>

        <PurePopupMiniForm
          title={this.props.t('LOG_HARVEST.ADD_CUSTOM_TYPE.TITLE')}
          inputInfo={this.props.t('LOG_HARVEST.ADD_CUSTOM_TYPE.INPUT_LABEL')}
          onClose={this.closeAddModal}
          onFormSubmit={this.addCustomType}
          isOpen={this.state.showAdd}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    users: userFarmSelector(state),
    allUseType: setAllHarvestUseTypesSelector(state),
    useType: selectedUseTypeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(HarvestUseType));
