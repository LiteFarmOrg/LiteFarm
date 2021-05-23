/* eslint-disable radix */
import React, { Component } from 'react';
import { createFrequencyNitrogenBalance } from '../../../containers/Insights/actions';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { Modal, Paper } from '@material-ui/core';
import { Semibold } from '../../Typography';
import styles from './styles.module.scss';
import { colors } from '../../../assets/theme';
import ReactSelect from '../../Form/ReactSelect';

class FrequencySelectorComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      value: '',
      durations: [4, 8, 12, 24],
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.postToDB = this.postToDB.bind(this);
  }

  render() {
    const { t } = this.props;
    const options = [
      { value: 'select Frequency', label: t('INSIGHTS.NITROGEN_BALANCE.SELECT_FREQUENCY') },
      ...this.state.durations.map((value, index) => {
        return {
          value: value,
          label: t('INSIGHTS.NITROGEN_BALANCE.COUNT_MONTHS', { count: value }),
        };
      }),
    ];
    return (
      <div>
        <Button color="primary" sm onClick={this.handleShow}>
          {t('INSIGHTS.NITROGEN_BALANCE.CHOOSE_FREQUENCY')}
        </Button>

        <Modal open={this.state.show} onClose={this.handleClose}>
          <Paper className={styles.paper}>
            <Semibold
              style={{
                color: colors.teal700,
                marginBottom: '20px',
              }}
            >
              {t('INSIGHTS.NITROGEN_BALANCE.CHOOSE_A_FREQUENCY')}
            </Semibold>

            <ReactSelect
              style={{ marginBottom: '20px' }}
              placeholder={t('INSIGHTS.NITROGEN_BALANCE.SELECT_FREQUENCY')}
              options={options}
              onChange={(e) => this.handleChange(e)}
            />

            <footer className={styles.footer}>
              <Button color="secondary" sm onClick={this.handleClose}>
                {t('common:CLOSE')}
              </Button>
              <Button color="primary" sm onClick={this.handleSave}>
                {t('common:SAVE')}
              </Button>
            </footer>
          </Paper>
        </Modal>
      </div>
    );
  }

  handleChange(event) {
    this.setState({ value: event.value });
  }

  handleSave() {
    this.postToDB(this.state.value);
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleClose() {
    this.setState({ show: false });
  }

  postToDB(dateValue) {
    const createdDate = new Date();
    let scheduledDate = new Date();
    scheduledDate.setMonth(scheduledDate.getMonth() + parseInt(dateValue));
    this.props.handler(scheduledDate, parseInt(dateValue));
    const body = {
      created_at: createdDate,
      scheduled_at: scheduledDate,
      frequency: parseInt(dateValue),
    };
    this.props.dispatch(createFrequencyNitrogenBalance(body));
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(withTranslation()(FrequencySelectorComponent));
