import React from 'react';
import Carousel from "nuka-carousel";
import AreaVideo from '../../../assets/videos/AreaDrawing.mp4';
import LineVideo from '../../../assets/videos/LineDrawing.mp4';
import PointVideo from '../../../assets/videos/AddingPoints.mp4';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './styles.module.scss';
import './styles.module.scss';
import TitleLayout from "../../Layout/TitleLayout";

function PureVideoView({ history }) {
  const height = window.innerHeight - 150;
  return (
    <TitleLayout title={'Map Tutorials'} onGoBack={() => history.push('/map')}>
      <div className={styles.revertPadding}>
        <Carousel
          initialSlideHeight={height}
          renderCenterLeftControls={({previousSlide}) => (
            <a onClick={previousSlide}>
              <BsChevronLeft style={{color: 'white'}} />
            </a>
            )
          }
          renderCenterRightControls={({nextSlide}) => (
            <a onClick={nextSlide}>
              <BsChevronRight style={{color: 'white'}} />
            </a>
        )}
        >
          <div className={styles.slideContainer}>
            <video autoPlay controls loop  className={styles.videoStyle} >
              <source type="video/mp4" src={AreaVideo}/>
              Sorry your browser doesn't support embedded videos
            </video>
          </div>
          <div className={styles.slideContainer}>
            <video autoPlay controls loop  className={styles.videoStyle}>
              <source type="video/mp4" src={LineVideo}/>
              Sorry your browser doesn't support embedded videos
            </video>
          </div>
          <div className={styles.slideContainer}>
            <video autoPlay controls  loop  className={styles.videoStyle}>
              <source type="video/mp4" src={PointVideo}/>
              Sorry your browser doesn't support embedded videos
            </video>
          </div>
        </Carousel>
      </div>
    </TitleLayout>
  )
}

export default PureVideoView;