/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (DrawingToolTipBox.js) is part of LiteFarm.
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

import React, {Component} from 'react';
import {Glyphicon, Modal} from 'react-bootstrap';
import Carousel from 'nuka-carousel';
import ReactPlayer from 'react-player';
import FirstVideo from './drawing.mp4';
import SecondVideo from './dragging.mp4';
import styles from './styles.scss';

class DrawingToolTipBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.initShow || false,
      playVideo: [false, false]
    };
    this.handleClose = this.handleClose.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleShow = this.toggleShow.bind(this);
  }

  handleClose() {
    this.setState({show: false})
  }

  toggleVideo(index) {
    let currentVideo = this.state.playVideo;
    currentVideo[index + 1] = true;
    this.setState({playVideo: currentVideo})
  }

  componentDidMount() {
    this.toggleVideo(-1);
  }

  toggleShow() {
    this.setState({show: true})
  }



  render() {
    const slides = [
      {
        text: 'Click on the map to draw dots to form a polygon',
        videoPath: FirstVideo,
      },
      {
        text: 'Rearrange the polygon by dragging the dots',
        videoPath: SecondVideo,
      }
    ];
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Body>
          <Carousel
            renderCenterRightControls={({currentSlide, nextSlide}) => (
              <div onClick={()=> this.toggleVideo(currentSlide)}>
                <a onClick={nextSlide} className={styles.nextSlide}>
                  <Glyphicon glyph="glyphicon glyphicon-chevron-right"/>
                </a>
              </div>)
            }
            renderCenterLeftControls={({previousSlide}) => (<a onClick={previousSlide} className={styles.nextSlide}>
              <Glyphicon glyph="glyphicon glyphicon-chevron-left"/>
            </a>)}>
            {slides.map((slide, index) => {
              return (
                <div className={styles.slideContainer} key={'slide-' + index}>
                  <h3>{slide.text}</h3>
                  <div>
                    <ReactPlayer loop playing={this.state.playVideo[index]} url={slide.videoPath}/>
                  </div>
                </div>
              )
            })}
          </Carousel>
        </Modal.Body>
      </Modal>
    )
  }
}

export default DrawingToolTipBox