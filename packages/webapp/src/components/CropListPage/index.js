import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import PureCropTile from '../CropTile';
import Layout from '../Layout';
import RouterTab from '../RouterTab';
import PageTitle from '../PageTitle/v2';
import NewFieldCropModal from '../Forms/NewFieldCropModal';
import { useComponentWidth } from '../../containers/hooks/useComponentWidthHeight';

export default function PureCropList({
  onFilterChange,
  onAddCrop,
  activeCrops,
  pastCrops,
  plannedCrops,
  history,
  match,
  isAdmin,
  title,
}) {
  const isSearchable = true;
  const { t } = useTranslation();

  const { ref: containerRef, width: containerWidth } = useComponentWidth();

  const cardWidth = 88;
  const minGap = 24;
  const getMinGap = (cropCount) => {
    const numberOfGap = Math.floor((containerWidth - cardWidth) / (cardWidth + minGap));
    const numberOfCard = numberOfGap + 1;
    if (cropCount < numberOfCard || numberOfCard <= 2) {
      return minGap;
    } else {
      return (containerWidth - numberOfCard * cardWidth) / numberOfGap;
    }
  };
  const [gap, setGap] = useState();
  useEffect(() => {
    setGap(
      Math.max(
        getMinGap(pastCrops?.length),
        getMinGap(plannedCrops?.length),
        getMinGap(activeCrops?.length),
      ),
    );
  }, [containerWidth, pastCrops, plannedCrops, activeCrops]);

  return (
    <Layout>
      <PageTitle title={title} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={[
          {
            label: t('FARM_MAP.TAB.CROPS'),
            path: match.url,
          },
          {
            label: t('FARM_MAP.TAB.DETAILS'),
            path: match.url.replace('crops', 'details'),
          },
        ]}
      />
      {isSearchable && (
        <Input
          style={{ marginBottom: '24px' }}
          placeholder={t('LOCATION_CROPS.INPUT_PLACEHOLDER')}
          isSearchBar={true}
          onChange={onFilterChange}
        />
      )}
      {/*{isAdmin && (*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      marginBottom: '20px',*/}
      {/*      width: 'fit-content',*/}
      {/*      fontSize: '16px',*/}
      {/*      color: 'var(--iconActive)',*/}
      {/*      lineHeight: '16px',*/}
      {/*      cursor: 'pointer',*/}
      {/*    }}*/}
      {/*    onClick={onAddCrop}*/}
      {/*  >*/}
      {/*    + <Underlined>{t('LOCATION_CROPS.ADD_NEW')}</Underlined>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/*TODO: deprecate*/}
      {isAdmin && (
        <NewFieldCropModal
          location_id={match.params.location_id}
          fieldArea={100}
          handler={() => {}}
        />
      )}
      <div ref={containerRef}>
        {activeCrops.length > 0 && (
          <>
            <div className={styles.labelContainer}>
              <div className={styles.label}>{t('LOCATION_CROPS.ACTIVE_CROPS')}</div>
              <div className={styles.cropCount} style={{ backgroundColor: '#037A0F' }}>
                {activeCrops.length}
              </div>
              <div className={styles.labelDivider} />
            </div>
            <div className={styles.tileContainer} style={{ columnGap: gap }}>
              {activeCrops.map((fc) => (
                <PureCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
                  status={'Active'}
                  style={{ width: `${cardWidth}px` }}
                />
              ))}
            </div>
          </>
        )}
        {plannedCrops.length > 0 && (
          <>
            <div className={styles.labelContainer}>
              <div className={styles.label}>{t('LOCATION_CROPS.PLANNED_CROPS')}</div>
              <div className={styles.cropCount} style={{ backgroundColor: '#7E4C0E' }}>
                {plannedCrops.length}
              </div>
              <div className={styles.labelDivider} />
            </div>
            <div className={styles.tileContainer} style={{ columnGap: gap }}>
              {plannedCrops.map((fc) => (
                <PureCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
                  status={'Planned'}
                  style={{ width: `${cardWidth}px` }}
                />
              ))}
            </div>
          </>
        )}
        {pastCrops.length > 0 && (
          <>
            <div className={styles.labelContainer}>
              <div className={styles.label}>{t('LOCATION_CROPS.PAST_CROPS')}</div>
              <div className={styles.cropCount} style={{ backgroundColor: '#085D50' }}>
                {pastCrops.length}
              </div>
              <div className={styles.labelDivider} />
            </div>
            <div className={styles.tileContainer} style={{ columnGap: gap }}>
              {pastCrops.map((fc) => (
                <PureCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
                  status={'Past'}
                  style={{ width: `${cardWidth}px` }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
