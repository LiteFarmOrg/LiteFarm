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
import styles from '../PageTitle/styles.module.scss';
import { BsInfoCircleFill } from 'react-icons/bs';
import { withTranslation } from 'react-i18next';
import Button from '../Form/Button';
import { Modal, Paper } from '@material-ui/core';
import { Info, Semibold } from '../Typography';
import { colors } from '../../assets/theme';

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
        <Modal open={this.state.show} onClose={this.handleClose}>
          <Paper className={styles.paper}>
            <Semibold style={{ color: colors.teal700, marginBottom: '20px' }}>{title}</Semibold>

            <Info style={{ color: colors.grey600, marginBottom: '20px' }}>{body}</Info>
            <footer>
              {showDelete && (
                <Button
                  onClick={() => {
                    this.handleDelete(deleteHandler);
                  }}
                  color={'secondary'}
                  sm
                >
                  {this.props.t('common:DELETE')}
                </Button>
              )}
              {showSave && (
                <Button
                  color={'primary'}
                  onClick={() => {
                    this.handleSave(saveHandler);
                  }}
                  sm
                >
                  {this.props.t('common:SAVE_CHANGES')}
                </Button>
              )}
              <Button variant="primary" onClick={this.handleClose} sm>
                {this.props.t('common:CLOSE')}
              </Button>
            </footer>
          </Paper>
        </Modal>
      </div>
    );
  }
}

export default withTranslation()(InfoBoxComponent);
