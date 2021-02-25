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
import { Button, Modal } from 'react-bootstrap';
import styles from '../PageTitle/styles.module.scss';
import { BsInfoCircleFill } from 'react-icons/bs';
import { withTranslation } from 'react-i18next';

class InfoBoxComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleSave(saveHandler) {
    saveHandler();
    this.setState({ show: false });
  }

  handleDelete(deleteHandler) {
    deleteHandler();
    this.setState({ show: false });
  }
  render() {
    const title = this.props.title;
    const body = this.props.body;

    const saveHandler = this.props.saveHandler;
    const showSave = this.props.showSave;

    const deleteHandler = this.props.deleteHandler;
    const showDelete = this.props.showDelete;

    const customStyle = this.props.customStyle;
    return (
      <div>
        <button style={customStyle} className={styles.buttonContainer} onClick={this.handleShow}>
          <BsInfoCircleFill />
        </button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{body}</Modal.Body>
          <Modal.Footer>
            {showDelete && (
              <Button
                variant="danger"
                onClick={() => {
                  this.handleDelete(deleteHandler);
                }}
              >
                {this.props.t('common:DELETE')}
              </Button>
            )}
            {showSave && (
              <Button
                variant="primary"
                onClick={() => {
                  this.handleSave(saveHandler);
                }}
              >
                {this.props.t('common:SAVE_CHANGES')}
              </Button>
            )}
            <Button variant="secondary" onClick={this.handleClose}>
              {this.props.t('common:CLOSE')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default withTranslation()(InfoBoxComponent);
