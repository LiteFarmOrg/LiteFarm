/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import styles from './styles.module.scss';
import { Button, Form, FormControl, FormGroup } from 'react-bootstrap';
import { sendContactForm } from './actions';
import { connect } from 'react-redux';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { FormErrors } from './FormErrors';

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      body: '',
      formErrors: { email: '', body: '' },
      emailValid: false,
      bodyValid: false,
      formValid: false,
    };
    this.handleContactFormChange = this.handleContactFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleContactFormChange(e) {
    const { id, value } = e.target;
    this.setState(
      {
        [id]: value,
      },
      () => {
        this.validateField(id, value);
      },
    );
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let emailValid = this.state.emailValid;
    let bodyValid = this.state.bodyValid;
    switch (fieldName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email = emailValid ? '' : ' is invalid';
        break;
      case 'body':
        bodyValid = value.length > 0;
        fieldValidationErrors.body = bodyValid ? '' : ' is too short';
        break;
      default:
        break;
    }
    this.setState(
      {
        formErrors: fieldValidationErrors,
        emailValid: emailValid,
        bodyValid: bodyValid,
      },
      this.validateForm,
    );
  }

  validateForm() {
    this.setState({ formValid: this.state.emailValid && this.state.bodyValid });
  }

  handleSubmit() {
    const contactForm = this.state;
    this.props.dispatch(sendContactForm(contactForm));
    this.setState({
      email: '',
      body: '',
    });
  }

  render() {
    return (
      <div className={styles.contactContainer}>
        <h4>
          <strong>Contact Form</strong>
          <div style={{ float: 'right' }}>
            <InfoBoxComponent
              title="Contact Form"
              body="You can also email us at litefarmapp@gmail.com"
            />
          </div>
        </h4>
        <hr />
        <div>
          <div>
            <h4>Submit your feedback and/or bugs using this form to make this app better!</h4>
          </div>
          <div className={styles.formContainer}>
            <div>
              <h3>
                <b>Contact Form</b>
              </h3>
            </div>
            <div className="panel panel-default">
              <FormErrors formErrors={this.state.formErrors} />
            </div>
            <Form>
              <FormGroup controlId="email">
                <h4>Email:</h4>
                <FormControl
                  type="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={(e) => this.handleContactFormChange(e)}
                />
              </FormGroup>
              <FormGroup controlId="body">
                <h4>Feedback:</h4>
                <FormControl
                  style={{ height: 200 }}
                  as="textarea"
                  placeholder="Enter text here..."
                  value={this.state.body}
                  onChange={(e) => this.handleContactFormChange(e)}
                />
              </FormGroup>
              <Button disabled={!this.state.formValid} onClick={this.handleSubmit}>
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(Contact);
