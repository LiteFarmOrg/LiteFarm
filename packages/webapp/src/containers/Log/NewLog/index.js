import React, { Component } from "react";
import { connect } from 'react-redux';
import styles from './styles.scss';
import PageTitle from '../../../components/PageTitle';
import { Grid, Row, Col } from 'react-bootstrap';
import fertImg from '../../../assets/images/log/fertilizing.png';
import fieldImg from '../../../assets/images/log/field_work.png';
import harvestImg from '../../../assets/images/log/harvest.png';
import pestImg from '../../../assets/images/log/pest.png';
import seedImg from '../../../assets/images/log/seeding.png';
import soilImg from '../../../assets/images/log/soil.png';
import otherImg from '../../../assets/images/log/other.png';
import irrigationImg from '../../../assets/images/log/irrigation.svg';
import history from '../../../history';
import scoutImg from '../../../assets/images/log/scout.svg';

class NewLog extends Component{

  render(){
    return(
      <div className={styles.logContainer}>
        <PageTitle title="New Log" backUrl="/log" />
        <h4>
          What do you want to log?
        </h4>
        <Grid fluid={true} style={{ marginLeft: 0, marginRight: 0, padding: '0 3%', marginTop: '5%' }}>
          <Row className="show-grid" >
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/fertilizing_log')}}>
              <div className={styles.typeContainer} >
                <img src={fertImg} alt=""/>
                <div>
                  Fertilizing
                </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/pest_control_log')}}>
              <div className={styles.typeContainer}>
              <img src={pestImg} alt=""/>
              <div>
                Pest Control
              </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/harvest_log')}}>
              <div className={styles.typeContainer}>
                <img src={harvestImg} alt=""/>
                <div>
                  Harvest
                </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/seeding_log')}}>
              <div className={styles.typeContainer}>
                <img src={seedImg} alt=""/>
                <div>
                  Seeding
                </div>
              </div>
            </Col>
          </Row>
          <Row className="show-grid" >
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/field_work_log')}}>
              <div className={styles.typeContainer}>
                <img src={fieldImg} alt=""/>
                <div>
                  Field Work
                </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/soil_data_log')}}>
              <div className={styles.typeContainer}>
                <img src={soilImg} alt=""/>
                <div>
                  Soil Analysis
                </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/irrigation_log')}}>
              <div className={styles.typeContainer}>
                <img src={irrigationImg} alt=""/>
                <div>
                  Irrigation
                </div>
              </div>
            </Col>
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/scouting_log')}}>
              <div className={styles.typeContainer}>
                <img src={scoutImg} alt=""/>
                <div>
                  Scouting
                </div>
              </div>
            </Col>
          </Row>
          <Row className="show-grid" >
            <Col xs={6} md={3} className={styles.col} onClick={()=>{history.push('/other_log')}}>
              <div className={styles.typeContainer}>
                <img src={otherImg} alt=""/>
                <div>
                  Other
                </div>
              </div>
            </Col>
          </Row>
        </Grid>

      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapDispatchToProps)(NewLog);
