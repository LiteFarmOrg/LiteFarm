/* eslint-disable radix */
import React, { Component } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createFrequencyNitrogenBalance } from '../../../containers/Insights/actions';
import { connect } from 'react-redux';

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
    return (
      <div>
        <Button variant="primary" onClick={this.handleShow}>
          Choose Frequency...
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Choose a frequency</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Control
              as="select"
              placeholder="Select Frequency"
              value={this.state.value}
              onChange={(e) => this.handleChange(e)}
            >
              <option key={'select Frequency'} value={'select Frequency'}>
                Select Frequency
              </option>
              {this.state.durations.map((value, index) => {
                return (
                  <option key={'freq-' + index} value={value}>
                    {' '}
                    {value} months{' '}
                  </option>
                );
              })}
            </Form.Control>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              {' '}
              Close{' '}
            </Button>
            <Button variant="primary" onClick={this.handleSave}>
              {' '}
              Save{' '}
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

export default connect(mapDispatchToProps)(FrequencySelectorComponent);
