import React, { useState, useEffect } from 'react';
import ReactJoyride, { STATUS } from 'react-joyride';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/add.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/export.svg';
import { useTranslation } from 'react-i18next';

export default function PureMapFooter({
  className,
  style,
  isAdmin,
}) {
  const { t } = useTranslation();

  const resetSpotlightStatus = (data) => {
    const { action, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      // resetSpotlight();
      console.log("reset spotlight");
    }
  };
  const steps = [
    {
      target: '#mapFirstStep',
      title: returnTitleContent(t('FARM_MAP.SPOTLIGHT.ADD_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.ADD')),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'right-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#mapSecondStep',
      title: returnTitleContent(t('FARM_MAP.SPOTLIGHT.FILTER_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.FILTER')),
      locale: {
        next: returnNextButton(t('common:NEXT')),
      },
      showCloseButton: false,
      placement: 'right-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#mapThirdStep',
      title: returnTitleContent(t('FARM_MAP.SPOTLIGHT.EXPORT_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.EXPORT')),
      locale: {
        last: returnNextButton(t('common:GOT_IT')),
      },
      placement: 'right-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 210,
        },
      },
      floaterProps: {
        styles: {
          floater: {
            marginRight: '12px',
          },
        },
      },
    },
  ];

  return (
    <>
      {/* {showSpotLight && ( */}
        <ReactJoyride
          steps={steps}
          continuous
          callback={resetSpotlightStatus}
          floaterProps={{ disableAnimation: true }}
          styles={{
            options: {
              // modal arrow color
              arrowColor: '#fff',
              // modal background color
              backgroundColor: '#fff',
              // tooltip overlay color
              overlayColor: 'rgba(30, 30, 48, 1)',
              // next button color
              primaryColor: '#FCE38D',
              //width of modal
              width: 270,
              //zindex of modal
              zIndex: 100,
            },
            buttonClose: {
              display: 'none',
            },
            buttonBack: {
              display: 'none',
            },
            tooltip: {
              padding: '20px',
            },
            tooltipContent: {
              padding: '4px 0 0 0',
              marginBottom: '20px',
            },
          }}
        />
      {/* )} */}
      <div
        className={[styles.container, className].join(' ')}
        style={style}
      >
        {isAdmin && <button className={styles.button} id="mapFirstStep"><AddLogo /></button>}
        <button className={styles.button} id="mapSecondStep"><FilterLogo /></button>
        <button className={styles.button} id="mapThirdStep"><ExportLogo /></button>
      </div>
    </>
  );
}

PureMapFooter.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
};

const returnTitleContent = (text) => {
  return (
    <span className={styles.spotlightTitle}>
      <p align='left' className={styles.spotlightText}>
        {text}
      </p>
    </span>
  )
};

const BodyContent = (text) => {
  const { t } = useTranslation();
  return (
    <>
      <p align='left'>{t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')}</p>
      <ul style={{paddingInlineStart: "20px"}}>
        {text.split(',').map(function (item, key) {
          return (
            <li className={styles.spotlightText}>
              {item}
            </li>
          );
        })}
      </ul>
    </>
  )
};

const returnNextButton = (text) => {
  return <span className={styles.spotlightButton}>{text}</span>;
};
