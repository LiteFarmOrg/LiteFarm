import React from 'react';
import styles from './styles.module.scss';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import PureCropTile from '../CropTile';
import Layout from '../Layout';
import RouterTab from '../RouterTab';
import PageTitle from '../PageTitle/v2';
import NewFieldCropModal from '../Forms/NewFieldCropModal';

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
      {activeCrops.length > 0 && (
        <>
          <div className={styles.labelContainer}>
            <div className={styles.label}>{t('LOCATION_CROPS.ACTIVE_CROPS')}</div>
            <div className={styles.cropCount} style={{ backgroundColor: '#037A0F' }}>
              {activeCrops.length}
            </div>
            <div className={styles.labelDivider} />
          </div>
          <div className={styles.tileContainer}>
            {activeCrops.map((fc) => (
              <PureCropTile
                history={history}
                key={fc.field_crop_id}
                fieldCrop={fc}
                status={'Active'}
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
          <div className={styles.tileContainer}>
            {plannedCrops.map((fc) => (
              <PureCropTile
                history={history}
                key={fc.field_crop_id}
                fieldCrop={fc}
                status={'Planned'}
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
          <div className={styles.tileContainer}>
            {pastCrops.map((fc) => (
              <PureCropTile
                history={history}
                key={fc.field_crop_id}
                fieldCrop={fc}
                status={'Past'}
              />
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
