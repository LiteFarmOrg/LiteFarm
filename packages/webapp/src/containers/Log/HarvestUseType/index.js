import React, { Component } from 'react';
import { connect, useSelector } from 'react-redux';
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
import { setSelectedUseTypes } from '../actions';
import PurePopupMiniForm from '../../../components/PopupMiniForm'
import Popup from 'reactjs-popup';
import { addCustomHarvestUseType } from '../Utility/saga';

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
      disabled: true,
      showAdd: false,
    };
    this.assignImage = this.assignImage.bind(this);
  }

  assignImage(useTypeName) {
    if (this.state.defaultUseTypeNames.includes(useTypeName)) {
      return this.state.imgDict[useTypeName];
    } else return OtherImg;
  }

  logClick(id) {
    this.setState({
      useTypeClicked: !this.state.useTypeClicked,
      currId: id,
    });
    if (!this.state.selectedUseTypes.includes(id)) {
      let selectedUses = this.state.selectedUseTypes;
      selectedUses.push(id);
      this.setState({
        selectedUses: selectedUses,
      });
    } else {
      if (this.state.selectedUseTypes.includes(id)) {
        let index = this.state.selectedUseTypes.indexOf(id);
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

    console.log(this.state.selectedUseTypes);
  }

  openAddModal = () => {
    this.setState({ showAdd: true });
  };

  closeAddModal = () => {
    this.setState({ showAdd: false });
  };

  addCustomType = (typeName) => {
    if (typeName !== '') {
      // this.props.dispatch(addCustomHarvestUseType("test value"));
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
            {this.props.location.state.map((type) => {
              const taskName = this.props.t(`task:${type.harvest_use_type_name}`);
              const buttonImg = this.assignImage(taskName);
              return (
                <Col
                  xs={4}
                  md={4}
                  className={styles.imgCol}
                  onClick={() => {
                    this.logClick(type.harvest_use_type_id);
                  }}
                >
                  <div
                    style={
                      this.state.selectedUseTypes.includes(type.harvest_use_type_id)
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
            <Button onClick={this.openAddModal}>{this.props.t('LOG_HARVEST.ADD_CUSTOM_USE_TYPE')}</Button>
          </div>
        )}

        <div className={styles.bottomContainer}>
          <div className={styles.backButton} onClick={() => history.push('/harvest_log')}>
            {this.props.t('common:BACK')}
          </div>
          <button
            className="btn btn-primary-round"
            onClick={this.nextPage}
            disabled={this.state.disabled}
          >
            {this.props.t('common:NEXT')}
          </button>
        </div>

        <Popup
          open={this.state.showAdd}
          closeOnDocumentClick
          onClose={this.closeAddModal}
          contentStyle={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            padding: '0 5%',
          }}
          overlayStyle={{ zIndex: '1060', height: '100vh' }}
        >
          <PurePopupMiniForm
            title={"Add a harvest use"}
            inputInfo={"Name of the custom harvest use"}
            onClose={this.closeAddModal}
            onFormSubmit={this.addCustomType}
          />
        </Popup>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    users: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(HarvestUseType));
