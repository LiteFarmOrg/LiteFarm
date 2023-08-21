import React, { Component } from 'react';

class PopUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  render() {
    return <div></div>;
  }
}

export default PopUp;
