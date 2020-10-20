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

import React, { Suspense } from 'react';
import Carousel from 'nuka-carousel';
import LoadingIndicator from '../../components/Callback/index';
import logo from '../../assets/images/logo2x.png'
import slide0 from '../../assets/images/introSliders/0.png';
import slide1 from '../../assets/images/introSliders/1.png';
import slide2 from '../../assets/images/introSliders/2.png';
import slide3 from '../../assets/images/introSliders/3.png';
import slide4 from '../../assets/images/introSliders/4.png';
import slide5 from '../../assets/images/introSliders/5.png';
import slide6 from '../../assets/images/introSliders/6.png';
//
import profile from '../../assets/videos/Profile.mp4';
import insights from '../../assets/videos/Insights.mp4';
import finances from '../../assets/videos/Finances.mp4';
import shift from '../../assets/videos/Shift.mp4';
import planCrops from '../../assets/videos/PlanCrops.mp4';
import log from '../../assets/videos/Log.mp4';
import field from '../../assets/videos/Field.mp4';
//
import styles from './styles.scss'
import {Button} from 'react-bootstrap';
import history from '../../history';
import ReactPlayer from 'react-player';
import {connect} from 'react-redux';
import {farmSelector} from '../selector';

class IntroSlide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoShown: [false, false, false, false, false, false],
    };
    this.toggleVideo = this.toggleVideo.bind(this);
  }

  toggleVideo(index) {
    const { videoShown } = this.state;
    // create a copy of the current videoShown array
    const updatedVideoShown = videoShown.map(videoIsVisible => videoIsVisible);
    updatedVideoShown[index] = !videoShown[index];
    this.setState({ videoShown: updatedVideoShown });
  }

  redirectFinish() {
    const { farm } = this.props;
    (farm && farm.has_consent)
      ? history.push('/home')
      : history.push('/consent', { role_id: farm.role_id })
  }

  render() {
    const slides = [
      {
        image: slide0,
        title: 'Add your team',
        videoPath: profile,
        description: 'First you\'ll want to add your team to the LiteFarm app. This is easy to do in the Profile section of the app.'
      },
      {
        image: slide1,
        title: 'Design your fields',
        videoPath: field,
        description: 'Next you want to add your fields and your planned crops for those fields. This is needed so you can use the rest of the app.'
      },
      {
        image: slide3,
        title: 'Plan your crops',
        videoPath: planCrops,
        description: 'Plan your crops by adding them to your fields in Fields.'
      },
      {
        image: slide2,
        title: 'Add logs',
        videoPath: log,
        description: 'Once you have fields and crops planned you can log management activities for each crop and field, such as inputs, harvests and more, in Logs.'
      },
      {
        image: slide6,
        title: 'Track your labour',
        videoPath: shift,
        description: 'You can track the cost of labour by crop and activity type using Shifts.'
      },
      {
        image: slide4,
        title: 'Check profits',
        videoPath: finances,
        description: 'Add sales, expenses, and track cost of production by crop in Finances.'
      },
      {
        image: slide5,
        title: 'Gather Insights',
        videoPath: insights,
        description: 'You can use the insights feature of the app to explore the biodiversity of your farm, your irrigation needs, and much more.'
      },
    ];
    return (
      <div style={{"height": '100vh'}}>
        <Carousel wrapAround heightMode={'max'}
          slideIndex={this.state.slideIndex}
          renderCenterRightControls={({nextSlide}) => (<a onClick={nextSlide} className={styles.nextSlide}>
            {/*<Glyphicon glyph="glyphicon glyphicon-chevron-right"/>*/}
          </a>)
          }
          renderCenterLeftControls={({previousSlide}) => (<a onClick={previousSlide} className={styles.nextSlide}>
            {/*<Glyphicon glyph="glyphicon glyphicon-chevron-left"/>*/}
          </a>)}
        >
          <div className={styles.slideContainer}>
            <img src={logo} alt="" />
            <h3>Welcome to LiteFarm!</h3>
            <div className={styles.descriptionGreen}>
              In the next few pages, we’ll get you set up with everything you need to know to start using the app.
            </div>
          </div>
          {slides.map((slide, index) => {
            return (
              <div key={'intro-slide-' + index} className={styles.slideContainer}>
                <Suspense fallback={LoadingIndicator}>
                  {/* Preload video player */}
                  <div hidden={!this.state.videoShown[index]}>
                    <ReactPlayer
                      onEnded={() => this.toggleVideo(index)}
                      style={{ marginTop: '3.5em' }}
                      playing={this.state.videoShown[index]}
                      url={slide.videoPath}
                    />
                  </div>
                  <div hidden={this.state.videoShown[index]}>
                    <img src={slide.image} alt="" />
                  </div>
                </Suspense>
                <h3>{slide.title}</h3>
                <div className={styles.description}>
                  {slide.description}
                </div>
                <Button className={styles.finishSlide} onClick={() => this.toggleVideo(index)}>Play Demo</Button>
              </div>)
          })}
          <div className={styles.slideContainer}>
            <img src={logo} alt=""/>
            <h3>You're ready to use the app!</h3>
            <Button onClick={() => this.redirectFinish()} className={styles.finishSlide}>Finish</Button>
          </div>
        </Carousel>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    farm: farmSelector(state),
  }
};

export default connect(mapStateToProps)(IntroSlide);
