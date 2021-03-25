import React, { useState } from 'react';
import Joyride, { ACTIONS, LIFECYCLE, STATUS } from 'react-joyride';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/add.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/export.svg';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import MapDrawer from '../../MapDrawer';
import { locationEnum } from '../../../containers/Map/constants';

export default function PureMapFooter({
  className,
  style,
  isAdmin,
  showSpotlight,
  resetSpotlight,
  onClickAdd,
  onClickExport,
  handleClickFilter,
  showModal,
  setShowMapFilter,
  showMapFilter,
  setShowAddDrawer,
  showAddDrawer,
  drawerDefaultHeight,
  filterSettings,
  onFilterMenuClick,
  onAddMenuClick,
  availableFilterSettings = {
    area: [
      locationEnum.barn,
      locationEnum.ceremonial_area,
      locationEnum.farm_site_boundary,
      locationEnum.field,
      locationEnum.garden,
      locationEnum.greenhouse,
      locationEnum.surface_water,
      locationEnum.natural_area,
      locationEnum.residence,
    ],
    line: [locationEnum.buffer_zone, locationEnum.watercourse, locationEnum.fence],
    point: [locationEnum.gate, locationEnum.water_valve],
  },
}) {
  const { t } = useTranslation();
  const [stepSpotlighted, setStepSpotlighted] = useState(null);

  const resetSpotlightStatus = (data) => {
    const { action, status, lifecycle } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
      setStepSpotlighted(null);
      resetSpotlight?.();
    } else if ([ACTIONS.UPDATE].includes(action) && lifecycle === LIFECYCLE.TOOLTIP) {
      setStepSpotlighted(data.index);
    }
  };
  const steps = [
    {
      target: '#mapFirstStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.ADD_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.ADD')),
      locale: {
        next: NextButtonContent(t('common:NEXT')),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'top-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#mapSecondStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.FILTER_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.FILTER')),
      locale: {
        next: NextButtonContent(t('common:NEXT')),
      },
      showCloseButton: false,
      placement: 'top-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#mapThirdStep',
      title: TitleContent(t('FARM_MAP.SPOTLIGHT.EXPORT_TITLE')),
      content: BodyContent(t('FARM_MAP.SPOTLIGHT.EXPORT')),
      locale: {
        last: NextButtonContent(t('common:GOT_IT')),
      },
      placement: 'top-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 240,
        },
      },
    },
  ];

  const { container, button, svg, spotlighted } = styles;
  return (
    <>
      {showSpotlight && (
        <Joyride
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
              zIndex: 1500,
            },
            buttonClose: {
              display: 'none',
            },
            buttonBack: {
              display: 'none',
            },
            tooltip: {
              padding: '16px',
            },
            buttonNext: {
              order: -1,
              minWidth: '81px',
              minHeight: '32px',
              boxShadow: '0px 2px 8px rgba(102, 115, 138, 0.3)',
              marginTop: '9px',
            },
            tooltipContent: {
              padding: '4px 0 0 0',
              marginBottom: '20px',
            },
            spotlight: {
              borderRadius: 0,
            },
          }}
          spotlightPadding={0}
        />
      )}
      <div className={clsx(container, className)} style={style}>
        {isAdmin && (
          <button
            className={clsx(button, (stepSpotlighted === 0 || showAddDrawer) && spotlighted)}
            id="mapFirstStep"
            onClick={onClickAdd}
          >
            <AddLogo className={svg} />
          </button>
        )}
        <button
          className={clsx(button, (stepSpotlighted === 1 || showMapFilter) && spotlighted)}
          id="mapSecondStep"
          onClick={handleClickFilter}
        >
          <FilterLogo className={svg} />
        </button>
        <button
          className={clsx(button, (stepSpotlighted === 2 || showModal) && spotlighted)}
          id="mapThirdStep"
          onClick={onClickExport}
        >
          <ExportLogo className={svg} />
        </button>
      </div>
      <MapDrawer
        key={'filter'}
        setShowMapDrawer={setShowMapFilter}
        showMapDrawer={showMapFilter}
        drawerDefaultHeight={drawerDefaultHeight}
        headerTitle={t('FARM_MAP.MAP_FILTER.TITLE')}
        filterSettings={filterSettings}
        availableFilterSettings={availableFilterSettings}
        onMenuItemClick={onFilterMenuClick}
      />
      <MapDrawer
        key={'add'}
        setShowMapDrawer={setShowAddDrawer}
        showMapDrawer={showAddDrawer}
        drawerDefaultHeight={window.innerHeight - 156}
        headerTitle={t('FARM_MAP.MAP_FILTER.ADD_TITLE')}
        onMenuItemClick={onAddMenuClick}
      />
    </>
  );
}

PureMapFooter.prototype = {
  className: PropTypes.string,
  style: PropTypes.object,
  isAdmin: PropTypes.bool,
  showSpotlight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  onClickAdd: PropTypes.func,
  onClickFilter: PropTypes.func,
  onClickExport: PropTypes.func,
  showModal: PropTypes.bool,
  setShowMapFilter: PropTypes.func,
  showMapFilter: PropTypes.bool,
  drawerDefaultHeight: PropTypes.number,
  filterSettings: PropTypes.func,
  onFilterMenuClick: PropTypes.func,
  onAddMenuClick: PropTypes.func,
  setShowAddDrawer: PropTypes.func,
  availableFilterSettings: PropTypes.shape({
    area: PropTypes.array,
    point: PropTypes.array,
    line: PropTypes.array,
  }),
};

const TitleContent = (text) => {
  return (
    <p align="left" className={styles.spotlightTitle}>
      {text}
    </p>
  );
};

const BodyContent = (text) => {
  const { t } = useTranslation();
  return (
    <>
      <p className={styles.spotlightText} align="left">
        {t('FARM_MAP.SPOTLIGHT.HERE_YOU_CAN')}
      </p>
      <ul style={{ paddingInlineStart: '20px' }}>
        {text.split(',').map(function (item, key) {
          return (
            <li key={key} className={styles.spotlightText}>
              {item}
            </li>
          );
        })}
      </ul>
    </>
  );
};

const NextButtonContent = (text) => {
  return <span className={styles.spotlightButton}>{text}</span>;
};
