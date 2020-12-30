import React, { Component } from 'react';
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { cropSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import { actions, Form } from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import styles from '../styles.scss';
import parseFields from '../Utility/parseFields';
import { addLog } from '../Utility/actions';
import parseCrops from '../Utility/parseCrops';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { currentFieldCropsSelector } from '../../fieldCropSlice';

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
    const { dispatch, fields } = this.props;
    let selectedFields = parseFields(log, fields);
    let selectedCrops = parseCrops(log);
    let formValue = {
      activity_kind: 'other',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      notes: log.notes,
    };
    dispatch(addLog(formValue));
  }

  render() {
    const crops = this.props.crops;
    const fields = this.props.fields;

    return (
      <div className="page-container">
        <PageTitle backUrl="/new_log" title={this.props.t('LOG_OTHER.TITLE')} />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('LOG_COMMON.CHOOSE_DATE')}
        />
        <Form
          model="logReducer.forms"
          className={styles.formContainer}
          onSubmit={(val) => this.handleSubmit(val.otherLog)}
        >
          <DefaultLogForm
            isCropNotRequired={true}
            model=".otherLog"
            fields={fields}
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
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(OtherLog));
