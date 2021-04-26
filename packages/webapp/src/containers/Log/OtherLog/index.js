import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle/v2';

import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.module.scss';
import parseFields from '../Utility/parseFields';
import { addLog } from '../Utility/actions';
import parseCrops from '../Utility/parseCrops';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedFieldCropsSelector } from '../../fieldCropSlice';
import { cropLocationsSelector } from '../../locationSlice';
import { Semibold } from '../../../components/Typography';

class OtherLog extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.otherLog'));
    this.state = {
      date: moment(),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit(log) {
    const { dispatch, locations } = this.props;
    let selectedFields = parseFields(log, locations);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_kind: 'other',
      date: this.state.date,
      crops: selectedCrops,
      locations: selectedFields,
      notes: log.notes,
    };
    dispatch(addLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const locations = this.props.locations;

    return (
      <div className='page-container'>
        <PageTitle onGoBack={() => this.props.history.push('/new_log')} onCancel={() => this.props.history.push('/log')}
                   style={{ paddingBottom: '24px' }} title={this.props.t('LOG_COMMON.ADD_A_LOG')} />
        <Semibold style={{ marginBottom: '24px' }}>{this.props.t('LOG_OTHER.TITLE')}</Semibold>
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          label={this.props.t('common:DATE')}

        />
        <Form
          model='logReducer.forms'
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.otherLog)}
        >
          <DefaultLogForm
            isCropNotRequired={true}
            model='.otherLog'
            locations={locations}
            crops={crops}
            notesField={true}
          />
          <LogFooter />
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    locations: cropLocationsSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(OtherLog));
