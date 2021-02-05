/* eslint-disable radix */
import React, { Component } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createFrequencyNitrogenBalance } from '../../../containers/Insights/actions';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

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
    return (
      <div>
        <Button variant="primary" onClick={this.handleShow}>
          {t("INSIGHTS.NITROGEN_BALANCE.CHOOSE_FREQUENCY")}
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{t("INSIGHTS.NITROGEN_BALANCE.CHOOSE_A_FREQUENCY")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              as="select"
              placeholder={t("INSIGHTS.NITROGEN_BALANCE.SELECT_FREQUENCY")}
              value={this.state.value}
              onChange={(e) => this.handleChange(e)}
            >
              <option key={'select Frequency'} value={'select Frequency'}>
                {t("INSIGHTS.NITROGEN_BALANCE.SELECT_FREQUENCY")}
              </option>
              {this.state.durations.map((value, index) => {
                return (
                  <option key={'freq-' + index} value={value}>
                    {t("INSIGHTS.NITROGEN_BALANCE.COUNT_MONTHS", { count: value })}
                  </option>
                );
              })}
            </Form.Control>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              {t("common:CLOSE")}
            </Button>
            <Button variant="primary" onClick={this.handleSave}>
              {t("common:SAVE")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
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
