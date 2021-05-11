import React from 'react';
import Carousel from "nuka-carousel";
import AreaVideo from '../../../assets/videos/AreaDrawing.mp4';
import LineVideo from '../../../assets/videos/LineDrawing.mp4';
import PointVideo from '../../../assets/videos/AddingPoints.mp4';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './styles.module.scss';
import './styles.module.scss';
import TitleLayout from "../../Layout/TitleLayout";
import ReactPlayer from "react-player";

function PureVideoView({ history }) {
  const height = window.innerHeight - 200;
  return (
    <TitleLayout title={'Map Tutorials'} onGoBack={() => history.push('/map')}>
        <Carousel
          height={height}
          initialSlideHeight={'first'}
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
            <ReactPlayer loop playing url={AreaVideo} />
          </div>
          <div className={styles.slideContainer}>
            <ReactPlayer loop playing url={LineVideo} />
          </div>
          <div className={styles.slideContainer}>
            <ReactPlayer loop playing url={PointVideo} />
          </div>
        </Carousel>
    </TitleLayout>
  )
}

export default PureVideoView;